# VMC Operator HMI — Deployment Guide

This guide covers deployment options for the **VMC-400 PRO Operator HMI** application.

---

## 🎯 Option 1: On-Premise Shopfloor Server / Local Production Build (Recommended for Workshops)

For shopfloor machines or local workshop network deployment:

```bash
# 1. Install production dependencies
npm install

# 2. Build production optimized bundle
npm run build

# 3. Start production server (Serves app on http://localhost:3000)
npm run start
```

- **Network Access**: Other shopfloor terminals on the same local network can access the HMI using `http://<SERVER-IP-ADDRESS>:3000`.

---

## ☁️ Option 2: Cloud Deployment via Vercel

To deploy to Vercel:

### Using Vercel CLI:
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy directly to Vercel
vercel
```

### Using GitHub Integration:
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the repository and click **Deploy**. Vercel will automatically build the Next.js App Router application.

---

## 🐳 Option 3: Docker Container Deployment (Render / Railway / VPS / AWS)

For persistent cloud deployment using Docker:

### Using Docker Compose locally or on a VPS:
```bash
# Build and start container in detached mode
docker compose up -d --build
```

### Deploying to Render / Railway / Fly.io:
1. Connect your repository to Render/Railway.
2. Select **Docker** as the environment runtime.
3. Set Port to `3000`.
4. Deploy!
