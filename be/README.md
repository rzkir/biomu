# Backend Biomu (Golang)

API backend untuk auth: verifikasi OTP, signup, login, session cookie. Frontend Next.js memanggil backend ini via `NEXT_PUBLIC_API_URL`.

## Persyaratan

- Go 1.22+
- Firebase project (Auth + Firestore)
- SMTP untuk kirim email OTP (opsional; tanpa ini OTP tidak terkirim)

## Environment

| Variabel | Wajib | Keterangan |
|----------|--------|------------|
| `COLLECTION_ACCOUNTS` atau `NEXT_PUBLIC_COLLECTIONS_ACCOUNTS` | Ya | Nama koleksi Firestore untuk akun |
| `GOOGLE_APPLICATION_CREDENTIALS` | Ya* | Path ke file JSON service account Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` / `FIREBASE_PROJECT_ID` | Ya* | Project ID Firebase |
| `FIREBASE_CLIENT_EMAIL` | Ya* | Client email dari service account |
| `FIREBASE_PRIVATE_KEY` | Ya* | Private key (boleh `\n` sebagai newline) |
| `EMAIL_ADMIN` | Opsional | Email pengirim OTP |
| `EMAIL_PASS_ADMIN` | Opsional | Password/App password email |
| `EMAIL_SERVICE` | Opsional | Mis. `gmail`, `outlook` |
| `PORT` | Opsional | Default `8080` |
| `CORS_ORIGIN` | Opsional | Default `http://localhost:3000` |

\* Jika tidak pakai `GOOGLE_APPLICATION_CREDENTIALS`, wajib set env Firebase (project ID, client email, private key).

## Menjalankan

```bash
# Dari folder backend
go run .

# Atau build dulu
go build -o biomu-backend .
./biomu-backend
```

Pastikan frontend Next.js di `fe/` punya `NEXT_PUBLIC_API_URL=http://localhost:8080` (atau URL backend Anda).

## Endpoint

- `POST /api/auth/verification` — Kirim OTP login (email harus sudah terdaftar)
- `POST /api/auth/signup` — Kirim OTP signup
- `POST /api/auth/verify-otp` — Verifikasi OTP, kembalikan custom token Firebase
- `POST /api/auth/session` — Set session cookie dari idToken
- `POST /api/auth/logout` — Hapus session cookie dan revoke token
