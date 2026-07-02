# 🚀 QuickHost Deployment Guide

This guide covers how to deploy QuickHost on your own server and set up automatic deployments using GitHub Actions and a self-hosted runner.

## 📋 Prerequisites

- A Linux server (Ubuntu/Debian recommended).
- Node.js (v18 or higher) and npm installed.
- A domain name with control over DNS records.
- (Optional) GitHub account for auto-deployment.

---

## 🛠️ Initial Server Setup

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Run the Installer
The easiest way to get started is using the provided `install.sh` script:
```bash
./install.sh
```
This script will:
- Install all dependencies.
- Build the React frontend.
- Install PM2 globally (if not present).
- Start the backend server in the background.

---

## 🌐 Domain & DNS Configuration

To use QuickHost with your domain, you need to configure wildcard subdomains.

### 1. DNS Records
Create a wildcard A record pointing to your server's IP:
- `*.yourdomain.com` -> `YOUR_SERVER_IP`

### 2. Environment Variables
Set the `BASE_DOMAIN` environment variable so QuickHost knows how to route subdomains.

Create a `.env` file in `quickhost/backend/.env`:
```env
PORT=3000
BASE_DOMAIN=yourdomain.com
```

Restart the server after changing environment variables:
```bash
pm2 restart quickhost
```

---

## 🤖 Auto-Deployment with GitHub Actions

QuickHost includes a GitHub Actions workflow for automatic deployment whenever you push to the `main` branch. This requires a **GitHub Self-Hosted Runner** on your server.

### 1. Set up a Self-Hosted Runner
1. Go to your GitHub repository on github.com.
2. Navigate to **Settings** > **Actions** > **Runners**.
3. Click **New self-hosted runner** and follow the instructions for Linux.
4. It is recommended to run the runner as a service so it starts automatically:
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

### 2. How it Works
The `.github/workflows/deploy.yml` file is already configured. When you push to `main`, the runner will:
1. Pull the latest code.
2. Install dependencies (`npm run setup`).
3. Build the frontend (`npm run build`).
4. Restart the backend process using PM2.

---

## 🔒 Security & Production Best Practices

### 1. Reverse Proxy (Nginx/Caddy/Traefik)
It is **highly recommended** to run QuickHost behind a reverse proxy. This allows you to use SSL (HTTPS) and adds a layer of security.

**Example Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com *.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Authentication
QuickHost currently has no built-in auth. Use your reverse proxy to add **Basic Auth** or an **SSO provider** (like Authelia or Cloudflare Access) to protect the `/` dashboard while keeping the subdomains public if desired.

---

## 📊 Managing the Application

QuickHost uses **PM2** for process management.

- **Check Status:** `pm2 status`
- **View Logs:** `pm2 logs quickhost`
- **Restart:** `pm2 restart quickhost`
- **Stop:** `pm2 stop quickhost`
- **Ensure startup on reboot:** `pm2 save`
