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
| `CORS_ORIGIN` | Opsional | Satu origin atau dipisah koma, mis. `http://localhost:3000,https://biomu.rizkiramadhan.web.id`. Default `http://localhost:3000` |

\* Jika tidak pakai `GOOGLE_APPLICATION_CREDENTIALS`, wajib set env Firebase (project ID, client email, private key).

## Menjalankan

### Menggunakan Go Langsung

```bash
# Dari folder backend
go run .

# Atau build dulu
go build -o biomu-backend .
./biomu-backend
```

### Menggunakan Docker

#### Build dan Run dengan Docker

```bash
# Build image
docker build -t biomu-backend .

# Run container
docker run -d \
  --name biomu-backend \
  -p 8080:8080 \
  -e COLLECTION_ACCOUNTS=accounts \
  -e FIREBASE_PROJECT_ID=your-project-id \
  -e FIREBASE_CLIENT_EMAIL=your-client-email \
  -e FIREBASE_PRIVATE_KEY="your-private-key" \
  -e CORS_ORIGIN=http://localhost:3000 \
  biomu-backend
```

#### Menggunakan Docker Compose

1. Buat file `.env` di folder `be/` dengan variabel environment yang diperlukan:

```bash
COLLECTION_ACCOUNTS=accounts
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
CORS_ORIGIN=http://localhost:3000
PORT=8080
SESSION_SECRET=your-session-secret
```

2. Jalankan dengan docker-compose:

```bash
# Dari folder backend
docker-compose up -d

# Atau untuk melihat logs
docker-compose up

# Stop container
docker-compose down
```

**Catatan:** Jika menggunakan `GOOGLE_APPLICATION_CREDENTIALS`, uncomment bagian `volumes` di `docker-compose.yml` dan mount file credentials Firebase Anda.

Pastikan frontend Next.js di `fe/` punya `NEXT_PUBLIC_API_URL=http://localhost:8080` (atau URL backend Anda).

## Endpoint

- `POST /api/auth/verification` — Kirim OTP login (email harus sudah terdaftar)
- `POST /api/auth/signup` — Kirim OTP signup
- `POST /api/auth/verify-otp` — Verifikasi OTP, kembalikan custom token Firebase
- `POST /api/auth/session` — Set session cookie dari idToken
- `POST /api/auth/logout` — Hapus session cookie dan revoke token
