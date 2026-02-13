package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"biomu/backend/internal/email"
	"biomu/backend/internal/firebase"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4/auth"
	"github.com/golang-jwt/jwt/v4"
	"google.golang.org/api/iterator"
)

type Handler struct {
	fb             *firebase.App
	email          email.Sender
	accountsColl   string
	sessionCookie  string
	sessionExpiry  time.Duration
	sessionSecret  []byte
}

func NewHandler(fb *firebase.App, email email.Sender, accountsColl, sessionCookie string, sessionExpiry time.Duration, sessionSecret []byte) *Handler {
	return &Handler{
		fb:             fb,
		email:          email,
		accountsColl:   accountsColl,
		sessionCookie:  sessionCookie,
		sessionExpiry:  sessionExpiry,
		sessionSecret:  sessionSecret,
	}
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func (h *Handler) readJSON(r *http.Request, v any) error {
	return json.NewDecoder(r.Body).Decode(v)
}

func generateOTP() string {
	const digits = "0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = digits[rand.Intn(len(digits))]
	}
	return string(b)
}

// POST /api/auth/verification — login flow: send OTP to existing account
func (h *Handler) Verification(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		Email string `json:"email"`
	}
	if err := h.readJSON(r, &body); err != nil {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		return
	}
	emailLower := strings.TrimSpace(strings.ToLower(body.Email))
	if emailLower == "" {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Email is required"})
		return
	}

	ctx := r.Context()
	snap, docRef, err := h.findAccountByEmail(ctx, emailLower)
	if err != nil {
		log.Printf("verification find account: %v", err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "An unexpected error occurred"})
		return
	}
	if snap == nil {
		h.writeJSON(w, http.StatusNotFound, map[string]string{"error": "Account not found"})
		return
	}

	otp := generateOTP()
	expiry := time.Now().Add(10 * time.Minute)
	_, err = docRef.Update(ctx, []firestore.Update{
		{Path: "resetToken", Value: otp},
		{Path: "resetTokenExpiry", Value: expiry},
	})
	if err != nil {
		log.Printf("verification update: %v", err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "An unexpected error occurred"})
		return
	}
	if h.email != nil {
		if err := h.email.SendPasswordReset(emailLower, otp); err != nil {
			log.Printf("verification send email: %v", err)
		}
	}
	h.writeJSON(w, http.StatusOK, map[string]string{"message": "Password reset code resent successfully"})
}

// POST /api/auth/signup — send signup OTP
func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		Email string `json:"email"`
	}
	if err := h.readJSON(r, &body); err != nil {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Email is required"})
		return
	}
	emailLower := strings.TrimSpace(strings.ToLower(body.Email))
	if emailLower == "" {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Email is required"})
		return
	}

	ctx := r.Context()
	snap, _, err := h.findAccountByEmail(ctx, emailLower)
	if err != nil {
		log.Printf("signup find: %v", err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Server misconfiguration: accounts collection not set"})
		return
	}
	otp := generateOTP()
	now := time.Now()
	expiry := now.Add(10 * time.Minute)
	coll := h.fb.DB.Collection(h.accountsColl)

	if snap != nil {
		// Sudah ada akun lengkap (punya role/provider) = sudah terdaftar
		data := snap.Data()
		if _, hasRole := data["role"]; hasRole {
			h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Email sudah terdaftar. Silakan gunakan email lain atau login."})
			return
		}
		// Pending signup: update OTP saja
		_, err = snap.Ref.Update(ctx, []firestore.Update{
			{Path: "signupOtp", Value: otp},
			{Path: "signupOtpExpiry", Value: expiry},
			{Path: "updatedAt", Value: now},
		})
	} else {
		_, _, err = coll.Add(ctx, map[string]interface{}{
			"email":           emailLower,
			"signupOtp":       otp,
			"signupOtpExpiry": expiry,
			"createdAt":       now,
			"updatedAt":      now,
		})
	}
	if err != nil {
		log.Printf("signup add/update: %v", err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Gagal mengirim kode verifikasi pendaftaran"})
		return
	}
	if h.email != nil {
		if err := h.email.SendSignupOTP(emailLower, otp); err != nil {
			log.Printf("signup send email: %v", err)
		}
	}
	h.writeJSON(w, http.StatusOK, map[string]string{"message": "Kode verifikasi pendaftaran berhasil dikirim"})
}

// findAccountByEmail returns snapshot and doc ref for the first doc with email == emailLower.
// If no document is found, returns (nil, nil, nil).
func (h *Handler) findAccountByEmail(ctx context.Context, emailLower string) (*firestore.DocumentSnapshot, *firestore.DocumentRef, error) {
	q := h.fb.DB.Collection(h.accountsColl).Where("email", "==", emailLower).Limit(1)
	it := q.Documents(ctx)
	defer it.Stop()
	doc, err := it.Next()
	if err == iterator.Done {
		return nil, nil, nil
	}
	if err != nil {
		return nil, nil, err
	}
	return doc, doc.Ref, nil
}

func getExpiryMillis(data map[string]interface{}, key string) (int64, bool) {
	v, ok := data[key]
	if !ok || v == nil {
		return 0, false
	}
	// Firestore Go client returns timestamp fields as time.Time
	if t, ok := v.(time.Time); ok {
		return t.UnixMilli(), true
	}
	return 0, false
}

// POST /api/auth/verify-otp
func (h *Handler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}
	if err := h.readJSON(r, &body); err != nil {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Email and OTP are required"})
		return
	}
	emailLower := strings.TrimSpace(strings.ToLower(body.Email))
	otpTrimmed := strings.TrimSpace(body.OTP)
	if emailLower == "" || otpTrimmed == "" || len(otpTrimmed) != 6 {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "OTP harus 6 digit"})
		return
	}

	ctx := r.Context()
	snap, docRef, err := h.findAccountByEmail(ctx, emailLower)
	if err != nil {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Email tidak ditemukan atau OTP tidak valid"})
		return
	}
	if snap == nil {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Email tidak ditemukan atau OTP tidak valid"})
		return
	}

	data := snap.Data()
	var storedOTP string
	var expiryKey string
	usedSignupOtp := false
	if v, ok := data["resetToken"]; ok && v != nil {
		storedOTP = strings.TrimSpace(stringFromAny(v))
		expiryKey = "resetTokenExpiry"
	} else if v, ok := data["signupOtp"]; ok && v != nil {
		storedOTP = strings.TrimSpace(stringFromAny(v))
		expiryKey = "signupOtpExpiry"
		usedSignupOtp = true
	}
	if storedOTP == "" {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "OTP tidak ditemukan. Silakan minta OTP baru"})
		return
	}

	expiryMs, ok := getExpiryMillis(data, expiryKey)
	if !ok || expiryMs < time.Now().UnixMilli() {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "OTP sudah kadaluarsa. Silakan minta OTP baru"})
		return
	}
	if storedOTP != otpTrimmed {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "OTP tidak valid. Silakan periksa kembali kode yang Anda masukkan"})
		return
	}

	uid := snap.Ref.ID
	updates := []firestore.Update{{Path: "updatedAt", Value: time.Now()}}
	if usedSignupOtp {
		updates = append(updates,
			firestore.Update{Path: "signupOtp", Value: firestore.Delete},
			firestore.Update{Path: "signupOtpExpiry", Value: firestore.Delete},
			firestore.Update{Path: "provider", Value: "email"},
			firestore.Update{Path: "status", Value: "reguler"},
			firestore.Update{Path: "role", Value: "user"},
		)
	} else {
		updates = append(updates,
			firestore.Update{Path: "resetToken", Value: firestore.Delete},
			firestore.Update{Path: "resetTokenExpiry", Value: firestore.Delete},
		)
	}
	if _, err := docRef.Update(ctx, updates); err != nil {
		log.Printf("verify-otp update: %v", err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Terjadi kesalahan saat memverifikasi OTP. Silakan coba lagi"})
		return
	}

	// Ensure Firebase Auth user exists
	_, err = h.fb.Auth.GetUser(ctx, uid)
	if err != nil && auth.IsUserNotFound(err) {
		_, err = h.fb.Auth.CreateUser(ctx, (&auth.UserToCreate{}).UID(uid).Email(emailLower).EmailVerified(true))
		if err != nil {
			log.Printf("verify-otp create user: %v", err)
			h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Terjadi kesalahan saat menyiapkan akun. Silakan coba lagi."})
			return
		}
	} else if err != nil {
		log.Printf("verify-otp get user: %v", err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Terjadi kesalahan saat menyiapkan akun. Silakan coba lagi."})
		return
	}

	// Set backend session cookie (FE tidak pakai Firebase, session di-handle BE)
	if len(h.sessionSecret) > 0 {
		h.setSessionCookie(w, r, uid)
	}
	h.writeJSON(w, http.StatusOK, map[string]string{"message": "OTP is valid"})
}

func stringFromAny(v interface{}) string {
	switch x := v.(type) {
	case string:
		return x
	case float64:
		return strings.TrimSuffix(strings.TrimSuffix(strings.TrimRight(fmt.Sprintf("%.0f", x), "0"), "."), ".")
	default:
		return fmt.Sprint(v)
	}
}

type sessionClaims struct {
	UID string `json:"uid"`
	jwt.RegisteredClaims
}

func (h *Handler) setSessionCookie(w http.ResponseWriter, r *http.Request, uid string) {
	if len(h.sessionSecret) == 0 {
		return
	}
	claims := sessionClaims{
		UID: uid,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(h.sessionExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := tok.SignedString(h.sessionSecret)
	if err != nil {
		log.Printf("session cookie sign: %v", err)
		return
	}
	secure := r.URL.Scheme == "https" || r.Header.Get("X-Forwarded-Proto") == "https"
	cookie := &http.Cookie{
		Name:     h.sessionCookie,
		Value:    signed,
		Path:     "/",
		MaxAge:   int(h.sessionExpiry.Seconds()),
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
	}
	// Agar cookie dikirim ke frontend (localhost:3000) dan backend (localhost:8080)
	if r.Host != "" && (r.Host == "localhost" || strings.HasPrefix(r.Host, "localhost:")) {
		cookie.Domain = "localhost"
	}
	http.SetCookie(w, cookie)
}

func (h *Handler) getUIDFromSessionCookie(r *http.Request) string {
	cookie, err := r.Cookie(h.sessionCookie)
	if err != nil || cookie == nil || cookie.Value == "" {
		return ""
	}
	// JWT has 3 parts; Firebase session cookie does not
	parts := strings.SplitN(cookie.Value, ".", 4)
	if len(parts) != 3 {
		return ""
	}
	var claims sessionClaims
	tok, err := jwt.ParseWithClaims(cookie.Value, &claims, func(*jwt.Token) (interface{}, error) {
		return h.sessionSecret, nil
	})
	if err != nil || !tok.Valid || claims.UID == "" {
		return ""
	}
	return claims.UID
}

func (h *Handler) docToUserResponse(doc *firestore.DocumentSnapshot) map[string]interface{} {
	data := doc.Data()
	if data == nil {
		return nil
	}
	out := map[string]interface{}{
		"uid": doc.Ref.ID,
	}
	for k, v := range data {
		if k == "createdAt" || k == "updatedAt" {
			if t, ok := v.(time.Time); ok {
				out[k] = t.UnixMilli()
			} else {
				out[k] = v
			}
		} else {
			out[k] = v
		}
	}
	return out
}

// oauthProviderFromClaims returns "google", "github", or "email" from Firebase ID token claims.
func oauthProviderFromClaims(claims map[string]interface{}) string {
	fb, _ := claims["firebase"].(map[string]interface{})
	if fb == nil {
		return "email"
	}
	signInProvider, _ := fb["sign_in_provider"].(string)
	switch signInProvider {
	case "google.com":
		return "google"
	case "github.com":
		return "github"
	default:
		return "email"
	}
}

// ensureOAuthAccount creates or updates Firestore account for OAuth user (uid = Firebase UID).
func (h *Handler) ensureOAuthAccount(ctx context.Context, uid, email, name, picture, provider string) error {
	docRef := h.fb.DB.Collection(h.accountsColl).Doc(uid)
	doc, err := docRef.Get(ctx)
	if err == nil && doc.Exists() {
		data := doc.Data()
		if _, hasRole := data["role"]; hasRole {
			return nil
		}
	}
	now := time.Now()
	payload := map[string]interface{}{
		"email":     strings.ToLower(strings.TrimSpace(email)),
		"provider":  provider,
		"role":      "user",
		"status":    "reguler",
		"createdAt": now,
		"updatedAt": now,
	}
	if name != "" {
		payload["displayName"] = name
	}
	if picture != "" {
		payload["image"] = picture
	}
	exists := err == nil && doc != nil && doc.Exists()
	if exists {
		updates := make([]firestore.Update, 0, len(payload))
		for path, value := range payload {
			updates = append(updates, firestore.Update{Path: path, Value: value})
		}
		_, err = docRef.Update(ctx, updates)
	} else {
		_, err = docRef.Set(ctx, payload)
	}
	return err
}

// POST /api/auth/session — set session cookie from idToken (email OTP or OAuth Google/GitHub)
func (h *Handler) Session(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		IDToken string `json:"idToken"`
	}
	if err := h.readJSON(r, &body); err != nil || body.IDToken == "" {
		h.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "idToken is required"})
		return
	}
	ctx := r.Context()
	tok, err := h.fb.Auth.VerifyIDToken(ctx, body.IDToken)
	if err != nil {
		log.Printf("session verify id token: %v", err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create session"})
		return
	}
	provider := oauthProviderFromClaims(tok.Claims)
	if provider != "email" {
		email, _ := tok.Claims["email"].(string)
		name, _ := tok.Claims["name"].(string)
		picture, _ := tok.Claims["picture"].(string)
		if err := h.ensureOAuthAccount(ctx, tok.UID, email, name, picture, provider); err != nil {
			log.Printf("session ensure oauth account: %v", err)
			h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create session"})
			return
		}
	}
	sessionCookie, err := h.fb.Auth.SessionCookie(ctx, body.IDToken, h.sessionExpiry)
	if err != nil {
		log.Printf("session cookie: %v", err)
		h.writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create session"})
		return
	}
	secure := false
	if r.URL.Scheme == "https" || r.Header.Get("X-Forwarded-Proto") == "https" {
		secure = true
	}
	http.SetCookie(w, &http.Cookie{
		Name:     h.sessionCookie,
		Value:    sessionCookie,
		Path:     "/",
		MaxAge:   int(h.sessionExpiry.Seconds()),
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
	})
	h.writeJSON(w, http.StatusOK, map[string]bool{"authenticated": true})
}

// GET /api/auth/session — verify session cookie and return user info (FE tidak pakai Firebase, user dari BE)
func (h *Handler) SessionGet(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	ctx := r.Context()
	var uid string

	// 1) Coba session JWT (backend session dari verify-otp)
	uid = h.getUIDFromSessionCookie(r)
	if uid == "" {
		// 2) Fallback: Firebase session cookie (backward compat)
		cookie, err := r.Cookie(h.sessionCookie)
		if err != nil || cookie == nil || cookie.Value == "" {
			h.writeJSON(w, http.StatusOK, map[string]any{"authenticated": false})
			return
		}
		tok, err := h.fb.Auth.VerifySessionCookieAndCheckRevoked(ctx, cookie.Value)
		if err != nil {
			h.writeJSON(w, http.StatusOK, map[string]any{"authenticated": false})
			return
		}
		uid = tok.UID
	}

	doc, err := h.fb.DB.Collection(h.accountsColl).Doc(uid).Get(ctx)
	if err != nil {
		h.writeJSON(w, http.StatusOK, map[string]any{"authenticated": true, "user": nil})
		return
	}
	userMap := h.docToUserResponse(doc)
	h.writeJSON(w, http.StatusOK, map[string]any{
		"authenticated": true,
		"user":          userMap,
	})
}

// POST /api/auth/logout
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	cookie, err := r.Cookie(h.sessionCookie)
	if err == nil && cookie.Value != "" {
		ctx := r.Context()
		if _, err := h.fb.Auth.VerifySessionCookieAndCheckRevoked(ctx, cookie.Value); err == nil {
			// token valid, revoke
			// VerifySessionCookie returns *auth.Token which has UID in Subject
			tok, _ := h.fb.Auth.VerifySessionCookie(ctx, cookie.Value)
			if tok != nil {
				_ = h.fb.Auth.RevokeRefreshTokens(ctx, tok.UID)
			}
		}
	}
	clearCookie := &http.Cookie{
		Name:     h.sessionCookie,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	if r.Host != "" && (r.Host == "localhost" || strings.HasPrefix(r.Host, "localhost:")) {
		clearCookie.Domain = "localhost"
	}
	http.SetCookie(w, clearCookie)
	h.writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}
