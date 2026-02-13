# Deployment Guide - Backend Biomu

Ada beberapa opsi untuk deploy backend Go ini. Pilih yang paling sesuai dengan kebutuhan Anda.

## 🎯 Opsi Deployment

### 1. **Render.com** (Paling Mudah - Free Tier Tersedia)

✅ **Keuntungan:**
- Free tier tersedia (dengan batasan)
- Auto-deploy dari GitHub
- Tidak perlu setup server manual
- HTTPS otomatis

📝 **Cara Deploy:**

1. Push code ke GitHub
2. Login ke [Render.com](https://render.com)
3. Klik "New +" → "Web Service"
4. Connect GitHub repo Anda
5. Render akan otomatis detect `render.yaml`
6. Set environment variables di dashboard:
   - `COLLECTION_ACCOUNTS`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `CORS_ORIGIN` (contoh: `https://your-frontend-domain.com`)
   - `SESSION_SECRET` (generate random string)
   - `EMAIL_ADMIN`, `EMAIL_PASS_ADMIN` (opsional)
7. Deploy!

**URL backend akan jadi:** `https://biomu-backend.onrender.com`

**Update Cloudflare Worker:**
```toml
# di be-worker/wrangler.toml
ORIGIN_API_URL = "https://biomu-backend.onrender.com"
```

---

### 2. **Fly.io** (Bagus untuk Global - Free Tier Tersedia)

✅ **Keuntungan:**
- Free tier dengan 3 shared VMs
- Global edge network
- Auto-scaling
- CLI yang powerful

📝 **Cara Deploy:**

```bash
# Install flyctl
# Windows: https://fly.io/docs/hands-on/install-flyctl/

# Login
fly auth login

# Launch (akan detect fly.toml)
cd be
fly launch

# Set secrets
fly secrets set FIREBASE_PROJECT_ID=your-project-id
fly secrets set FIREBASE_CLIENT_EMAIL=your-email
fly secrets set FIREBASE_PRIVATE_KEY="your-key"
fly secrets set COLLECTION_ACCOUNTS=accounts
fly secrets set CORS_ORIGIN=https://your-frontend.com
fly secrets set SESSION_SECRET=$(openssl rand -hex 32)

# Deploy
fly deploy
```

**URL backend akan jadi:** `https://biomu-backend.fly.dev`

---

### 3. **Railway** (Sangat Mudah - Pay as You Go)

✅ **Keuntungan:**
- Auto-deploy dari GitHub
- Pay as you go ($5 credit gratis/bulan)
- Simple dashboard

📝 **Cara Deploy:**

1. Push code ke GitHub
2. Login ke [Railway.app](https://railway.app)
3. "New Project" → "Deploy from GitHub repo"
4. Pilih repo Anda
5. Railway akan auto-detect Dockerfile
6. Set environment variables di dashboard
7. Deploy!

**URL backend akan jadi:** `https://biomu-backend.up.railway.app`

---

### 4. **VPS Tradisional** (DigitalOcean, Vultr, dll)

✅ **Keuntungan:**
- Full control
- Bisa lebih murah untuk high traffic
- Bisa install tools lain

📝 **Cara Deploy:**

#### Setup Awal di VPS:

```bash
# SSH ke VPS
ssh user@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repo (atau upload via SCP)
git clone https://github.com/your-username/biomu.git
cd biomu/be

# Buat file .env
nano .env
# Isi dengan semua environment variables

# Deploy
docker-compose up -d

# Setup Nginx reverse proxy (opsional, untuk HTTPS)
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

#### Auto-deploy dengan Script:

```bash
# Upload deploy script ke VPS
scp deploy-vps.sh user@your-vps:/home/user/

# SSH ke VPS
ssh user@your-vps
chmod +x deploy-vps.sh
./deploy-vps.sh
```

#### Setup Auto-deploy dengan GitHub Actions (Opsional):

Buat file `.github/workflows/deploy-vps.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]
    paths:
      - 'be/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /path/to/biomu/be
            git pull
            docker-compose build
            docker-compose up -d
```

---

## 🔗 Setup Cloudflare Worker Setelah Deploy

Setelah backend Anda sudah live di salah satu platform di atas, update Cloudflare Worker:

1. **Update `be-worker/wrangler.toml`:**

```toml
[vars]
ORIGIN_API_URL = "https://your-backend-url.com"  # URL dari platform yang Anda pilih
```

2. **Deploy Worker:**

```bash
cd be-worker
npx wrangler deploy
```

3. **Update Frontend:**

Di `fe/.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://your-worker-url.workers.dev
# atau jika pakai custom domain:
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

---

## 📊 Perbandingan Opsi

| Platform | Free Tier | Kesulitan | Best For |
|----------|-----------|-----------|----------|
| **Render** | ✅ Ya | ⭐ Mudah | MVP, Prototype |
| **Fly.io** | ✅ Ya | ⭐⭐ Sedang | Global apps |
| **Railway** | ✅ $5 credit | ⭐ Mudah | Quick deploy |
| **VPS** | ❌ ~$5/bulan | ⭐⭐⭐ Sulit | Full control |

---

## 🎯 Rekomendasi

- **Untuk development/testing:** **Render.com** (paling mudah, free tier)
- **Untuk production:** **Fly.io** atau **Railway** (lebih stabil)
- **Jika sudah punya VPS:** Pakai VPS dengan Docker Compose

---

## 🔒 Security Notes

- **Jangan commit** file `.env` atau credentials ke Git
- Gunakan **secrets management** di platform yang Anda pilih
- Set **CORS_ORIGIN** dengan domain production Anda
- Generate **SESSION_SECRET** yang kuat (random 32+ karakter)
- Gunakan **HTTPS** untuk semua komunikasi
