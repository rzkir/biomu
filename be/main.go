package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"biomu/backend/internal/auth"
	"biomu/backend/internal/db"
	"biomu/backend/internal/email"
	"biomu/backend/internal/firebase"

	"github.com/joho/godotenv"
)

const (
	sessionCookieName = "session"
	sessionDuration   = 7 * 24 * time.Hour
	portDefault       = "8080"
)

func main() {
	ctx := context.Background()

	// Auto-load .env if present (local dev convenience)
	_ = godotenv.Load()

	// Firebase
	fb, err := firebase.Init(ctx)
	if err != nil {
		log.Fatalf("firebase init: %v", err)
	}

	// Email (SMTP)
	emailSender, err := email.NewSender(os.Getenv("EMAIL_ADMIN"), os.Getenv("EMAIL_PASS_ADMIN"), os.Getenv("EMAIL_SERVICE"))
	if err != nil {
		log.Printf("warning: email sender not configured: %v", err)
	}

	accountsColl := os.Getenv("COLLECTION_ACCOUNTS")
	if accountsColl == "" {
		accountsColl = os.Getenv("NEXT_PUBLIC_COLLECTIONS_ACCOUNTS")
	}
	if accountsColl == "" {
		log.Fatal("COLLECTION_ACCOUNTS or NEXT_PUBLIC_COLLECTIONS_ACCOUNTS must be set")
	}

	sessionSecret := os.Getenv("SESSION_SECRET")
	if sessionSecret == "" {
		sessionSecret = "dev-session-secret-change-in-production"
		log.Printf("warning: SESSION_SECRET not set, using default (dev only)")
	}

	authHandler := auth.NewHandler(fb, emailSender, accountsColl, sessionCookieName, sessionDuration, []byte(sessionSecret))
	dbHandler := db.NewHandler(fb)

	mux := http.NewServeMux()

	// Explicit OPTIONS handlers so preflight always gets 204 + CORS (Go 1.22 mux otherwise returns 405 for OPTIONS).
	opt := func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) }
	mux.HandleFunc("OPTIONS /api/auth/verification", opt)
	mux.HandleFunc("OPTIONS /api/auth/signup", opt)
	mux.HandleFunc("OPTIONS /api/auth/verify-otp", opt)
	mux.HandleFunc("OPTIONS /api/auth/session", opt)
	mux.HandleFunc("OPTIONS /api/auth/logout", opt)

	mux.HandleFunc("POST /api/auth/verification", authHandler.Verification)
	mux.HandleFunc("POST /api/auth/signup", authHandler.Signup)
	mux.HandleFunc("POST /api/auth/verify-otp", authHandler.VerifyOTP)
	mux.HandleFunc("POST /api/auth/session", authHandler.Session)
	mux.HandleFunc("GET /api/auth/session", authHandler.SessionGet)
	mux.HandleFunc("POST /api/auth/logout", authHandler.Logout)

	// Generic Firestore CRUD (Go 1.22 pattern matching)
	mux.HandleFunc("GET /api/db/{collection}", dbHandler.List)
	mux.HandleFunc("GET /api/db/{collection}/{id}", dbHandler.Get)
	mux.HandleFunc("POST /api/db/{collection}", dbHandler.Create)
	mux.HandleFunc("PATCH /api/db/{collection}/{id}", dbHandler.Update)
	mux.HandleFunc("PUT /api/db/{collection}/{id}", dbHandler.Update)
	mux.HandleFunc("DELETE /api/db/{collection}/{id}", dbHandler.Delete)

	port := os.Getenv("PORT")
	if port == "" {
		port = portDefault
	}
	log.Printf("backend listening on :%s", port)
	if err := http.ListenAndServe(":"+port, corsMiddleware(mux)); err != nil {
		log.Fatalf("server: %v", err)
	}
}

// corsMiddleware wraps the handler to add CORS headers and handle OPTIONS (preflight) for all routes.
// Without this, OPTIONS requests hit no route and return 404 without CORS headers, causing browser CORS errors.
func corsMiddleware(next http.Handler) http.Handler {
	allowedOrigin := os.Getenv("CORS_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
