# 🚀 QuickHost

QuickHost is a lightweight, self-hosted web application that allows you to quickly create, edit, and instantly deploy websites to subdomains on your own domain.

Featuring a modern web UI and an integrated Monaco Editor, QuickHost lets you manage and modify your projects' HTML, CSS, and JS files directly in the browser.

---

## ✨ Features

*   **⚡ Instant Deployment:** Sites are served immediately on `subdomain.yourdomain.com`.
*   **📝 In-Browser Editor:** Edit files directly using the Monaco Editor (the same engine as VS Code).
*   **📦 Self-Contained:** Uses an embedded SQLite database for zero-config data storage.
*   **🌐 Wildcard Subdomain Support:** Advanced routing for `*.yourdomain.com` and even `*.dev.yourdomain.com`.
*   **🛠️ npm Support:** Easy management with root-level npm scripts.

---

## ⚡ One-Line Install

Run the following command to install dependencies, build the frontend, and start QuickHost in the background using `pm2`:

```bash
curl -sSL https://raw.githubusercontent.com/Leopixel1/dev-host/refs/heads/main/install.sh | bash
```

*(Note: Replace the URL with your actual repository URL if hosting elsewhere)*

Or locally:

```bash
./install.sh
```

---

## 🛠️ Manual Installation & Development

### Setup

Install all dependencies for both frontend and backend:

```bash
npm run setup
```

### Development

Run both the backend and frontend in development mode with hot reloading:

```bash
npm run dev
```

### Production Build

Build the React frontend for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## 🌐 Advanced Subdomain Configuration

QuickHost supports nested wildcard subdomains (e.g., `*.dev.yourdomain.com`).

To configure your base domain, set the `BASE_DOMAIN` environment variable:

```bash
# Example for dev.yourdomain.com
export BASE_DOMAIN=dev.yourdomain.com
npm start
```

### DNS Setup
1. Create a wildcard A record: `*.yourdomain.com` -> `YOUR_SERVER_IP`
2. (Optional) For nested subdomains: `*.dev.yourdomain.com` -> `YOUR_SERVER_IP`

---

## 📦 Using npm Packages in Your Projects

While QuickHost projects are served as static files, you can easily use npm packages via ESM CDNs like **esm.sh** or **Skypack**.

**Example:**

```html
<script type="module">
  import confetti from 'https://esm.sh/canvas-confetti';

  confetti();
</script>
```

---

## 🏛️ Architecture

*   **Frontend:** React SPA built with Vite, Tailwind CSS, and Lucide Icons.
*   **Backend:** Node.js Express application using `better-sqlite3`.
*   **Routing:** Custom middleware inspects the `Host` header to serve project files based on the extracted subdomain.

---

## 🔒 Security Note

QuickHost currently does not have built-in authentication. It is **strongly recommended** to run it behind a reverse proxy (like Nginx, Caddy, or Traefik) and use Basic Auth or an SSO provider to protect the dashboard.
