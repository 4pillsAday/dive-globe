# DiveGlobe Starter (drop-in files)

This folder contains **drop-in files** for a Next.js App Router project. Use it if you’re starting from scratch _or_ want a minimal reference implementation for a 3D globe + Webflow CMS.
It assumes you’ll create a new Next.js app first and then copy these files over.

## 0) Prereqs (install once)
- Node.js 20+ and npm (from nodejs.org)
- Git + GitHub account
- VS Code (recommended)

## 1) Create a fresh Next.js app
```bash
npx create-next-app@latest diveglobe --ts --eslint --app --src-dir --tailwind
cd diveglobe
```

> If you prefer no Tailwind, omit `--tailwind`.

## 2) Copy these files into your new app
Copy the folders from **this** zip (`app/`, `components/`, `lib/`, `public/`) into your `diveglobe/` project. If prompted, allow overwriting existing placeholder files.

## 3) Install globe dependency
```bash
npm install react-globe.gl
```

## 4) Configure env vars
Copy `.env.example` to `.env.local` and fill:
```
WEBFLOW_API_TOKEN=YOUR_TOKEN
WEBFLOW_SITE_ID=your_site_id
DIVE_COLLECTION_ID=your_collection_id
NEXT_PUBLIC_BASE_PATH=/app   # match your Webflow Cloud mount path
```
> `NEXT_PUBLIC_BASE_PATH` should equal your **Webflow Cloud mount path** (e.g. `/app`).

## 5) Set basePath in Next config
Edit `next.config.mjs` to include your base/mount path so routes & assets work in Webflow Cloud:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default nextConfig;
```

## 6) Run locally
```bash
npm run dev
```

Open http://localhost:3000 and you should see the 3D globe. The globe uses sample dive sites if env vars aren’t set.

## 7) Deploy to Webflow Cloud (summary)
1. Push your repo to GitHub.
2. In your Webflow site settings → **Webflow Cloud**, connect GitHub and create a Project + Environment.
3. Set the **Mount path** (e.g. `/app`) and add the env vars in the Environment UI.
4. Publish your Webflow site, then **Deploy**.
5. Visit `yourdomain.com/app` (or `yoursite.webflow.io/app`).

> See Webflow Cloud docs for full step‑by‑step details.
