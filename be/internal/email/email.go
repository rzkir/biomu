package email

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"strings"
)

type Sender interface {
	SendPasswordReset(to, otp string) error
	SendSignupOTP(to, otp string) error
}

type sender struct {
	from     string
	auth     smtp.Auth
	host     string
	addr     string
	insecure bool
}

func NewSender(user, pass, service string) (Sender, error) {
	if user == "" || pass == "" {
		return nil, fmt.Errorf("EMAIL_ADMIN and EMAIL_PASS_ADMIN required")
	}
	host, port := "smtp.gmail.com", "587"
	if service != "" {
		switch strings.ToLower(service) {
		case "gmail":
			host, port = "smtp.gmail.com", "587"
		case "outlook", "office365":
			host, port = "smtp.office365.com", "587"
		default:
			host = service
			port = "587"
		}
	}
	addr := host + ":" + port
	auth := smtp.PlainAuth("", user, pass, host)
	return &sender{
		from:     user,
		auth:     auth,
		host:     host,
		addr:     addr,
		insecure: false,
	}, nil
}

func (s *sender) send(to, subject, bodyText, bodyHTML string) error {
	headers := map[string]string{
		"From":         `"SMM Panel Landing" <` + s.from + ">",
		"To":           to,
		"Subject":      subject,
		"MIME-Version": "1.0",
		"Content-Type": "text/html; charset=UTF-8",
	}
	var sb strings.Builder
	for k, v := range headers {
		sb.WriteString(k + ": " + v + "\r\n")
	}
	sb.WriteString("\r\n")
	sb.WriteString(bodyHTML)

	msg := []byte(sb.String())
	if s.insecure {
		tlsConfig := &tls.Config{ServerName: s.host, InsecureSkipVerify: true}
		conn, err := tls.Dial("tcp", s.addr, tlsConfig)
		if err != nil {
			return err
		}
		defer conn.Close()
		c, err := smtp.NewClient(conn, s.host)
		if err != nil {
			return err
		}
		defer c.Close()
		if err = c.Auth(s.auth); err != nil {
			return err
		}
		if err = c.Mail(s.from); err != nil {
			return err
		}
		if err = c.Rcpt(to); err != nil {
			return err
		}
		w, err := c.Data()
		if err != nil {
			return err
		}
		_, err = w.Write(msg)
		if err != nil {
			return err
		}
		return w.Close()
	}
	return smtp.SendMail(s.addr, s.auth, s.from, []string{to}, msg)
}

func (s *sender) SendPasswordReset(to, otp string) error {
	html := passwordResetHTML(otp)
	text := "SMM Panel Landing Password Reset Code: " + otp + ". It expires in 10 minutes."
	return s.send(to, "SMM Panel Landing Password Reset Code", text, html)
}

func (s *sender) SendSignupOTP(to, otp string) error {
	html := signupOTPHTML(otp)
	text := "Kode verifikasi pendaftaran Anda adalah: " + otp + ". Kode berlaku selama 10 menit."
	return s.send(to, "Kode verifikasi pendaftaran akun", text, html)
}

func passwordResetHTML(otp string) string {
	// OTP dalam satu elemen teks agar bisa di-select dan di-copy di semua klien email
	otpEscaped := strings.ReplaceAll(otp, "<", "&lt;")
	otpEscaped = strings.ReplaceAll(otpEscaped, ">", "&gt;")
	return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0; padding:0; background:#0f172a; -webkit-user-select:text; user-select:text;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:420px; width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:16px;">
    <tr><td style="padding:24px 24px 16px; text-align:center;"><h1 style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:20px; font-weight:600; color:#f1f5f9;">Kode verifikasi login</h1></td></tr>
    <tr><td style="padding:8px 24px 24px; text-align:center;">
      <p style="margin:0 0 12px; font-size:14px; color:#94a3b8;">Gunakan kode berikut (bisa dicopy):</p>
      <div style="display:inline-block; padding:16px 28px; background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:12px;">
        <code style="font-family:'SF Mono',Monaco,Consolas,monospace; font-size:28px; font-weight:600; letter-spacing:0.35em; color:#fff; -webkit-user-select:all; user-select:all;">` + otpEscaped + `</code>
      </div>
      <p style="margin:16px 0 0; font-size:12px; color:#64748b;">Kode berlaku 10 menit.</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`
}

func signupOTPHTML(otp string) string {
	otpEscaped := strings.ReplaceAll(otp, "<", "&lt;")
	otpEscaped = strings.ReplaceAll(otpEscaped, ">", "&gt;")
	return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0; padding:0; background:#0f172a; -webkit-user-select:text; user-select:text;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:420px; width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:16px;">
    <tr><td style="padding:24px 24px 16px; text-align:center;"><h1 style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:20px; font-weight:600; color:#f1f5f9;">Kode verifikasi pendaftaran</h1></td></tr>
    <tr><td style="padding:8px 24px 24px; text-align:center;">
      <p style="margin:0 0 12px; font-size:14px; color:#94a3b8;">Gunakan kode berikut (bisa dicopy):</p>
      <div style="display:inline-block; padding:16px 28px; background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:12px;">
        <code style="font-family:'SF Mono',Monaco,Consolas,monospace; font-size:28px; font-weight:600; letter-spacing:0.35em; color:#fff; -webkit-user-select:all; user-select:all;">` + otpEscaped + `</code>
      </div>
      <p style="margin:16px 0 0; font-size:12px; color:#64748b;">Kode berlaku 10 menit.</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`
}
