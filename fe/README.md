Ini adalah **frontend only** (Next.js) untuk Biomu. Backend API berjalan terpisah (Golang).

## Environment

Di `.env.local` set:

- `NEXT_PUBLIC_API_URL` — URL backend Go (contoh: `http://localhost:8080`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` — untuk login Google/GitHub (dari Firebase Console → Project settings → Your apps)
- `NEXT_PUBLIC_COLLECTIONS_ACCOUNTS` — (opsional) nama koleksi Firestore untuk akun

Aktifkan provider **Google** dan **GitHub** di Firebase Console → Authentication → Sign-in method.

Tanpa `NEXT_PUBLIC_API_URL`, request API akan mengarah ke same-origin (pastikan ada proxy atau backend di origin yang sama).

## Getting Started

Jalankan backend Go terlebih dahulu (lihat folder `../backend`), lalu:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
