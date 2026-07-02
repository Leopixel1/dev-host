# QuickHost

QuickHost is a lightweight, self-hosted web application that allows you to quickly create, edit, and instantly deploy websites to subdomains on your own domain.

It features a modern web UI to manage your projects and an integrated Monaco Editor to modify your HTML, CSS, and JS files directly in the browser.

## Features

* **Instant Deployment:** Sites are served immediately on `subdomain.yourdomain.com` without build steps.
* **In-Browser Editor:** Edit files directly using an integrated Monaco Editor (the same editor that powers VS Code).
* **Self-Contained:** Uses an embedded SQLite database to store project metadata and file contents.
* **Single Process:** The Node.js backend serves both the API, the dynamically hosted subdomains, and the statically built React frontend UI.

## Requirements

* Node.js (v18+ recommended)
* npm

## Installation

### 1-Click Auto Install (Recommended)

To automatically install dependencies, build the frontend, and run the server in the background using `pm2`, run:

```bash
./install.sh
```

### Manual Installation

1. Clone this repository or download the source code.
2. Install dependencies for both the backend and frontend:

\`\`\`bash
# Install backend dependencies
cd quickhost/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
\`\`\`

## Building and Running (Manual)

1. Build the React frontend. The backend is configured to serve these compiled static files.

\`\`\`bash
cd quickhost/frontend
npm run build
\`\`\`

2. Start the backend server:

\`\`\`bash
cd ../backend
node server.js
\`\`\`

The application will be running on port 3000 by default.

## Usage

### Local Development / Testing

By default, the server runs on `localhost:3000`.
1. Navigate to `http://localhost:3000` to access the QuickHost Dashboard.
2. Create a new project. You will assign it a subdomain (e.g., `mysite`).
3. You can access the site at `http://mysite.localhost:3000`. (Note: Modern browsers route `*.localhost` loopback automatically. If yours doesn't, you may need to edit your OS `hosts` file for testing).

### Production Deployment

To use this with a real domain (e.g., `*.mydomain.com`):

1. **DNS Setup:** Configure a wildcard A record (`*.mydomain.com` and `mydomain.com`) pointing to your server's IP address.
2. **Reverse Proxy:** It is highly recommended to run QuickHost behind a reverse proxy like Nginx, Caddy, or Traefik to handle SSL/TLS termination and route traffic on ports 80/443 to the QuickHost node process on port 3000.
3. **Security:** QuickHost currently does not have built-in authentication. When deploying to the internet, you **must** secure the root domain (where the dashboard lives) using basic authentication or an SSO proxy (like Authelia or Cloudflare Access) at your reverse proxy layer, while allowing public access to the subdomains.

## Architecture

* **Frontend (`quickhost/frontend`):** A React SPA built with Vite, Tailwind CSS, and Lucide Icons.
* **Backend (`quickhost/backend`):** An Express.js application using `better-sqlite3`.
* **Routing:** The Express app features custom middleware that inspects the `Host` header. If the host is a recognized subdomain, it serves the file content from the SQLite database. Otherwise, it serves the API or the static frontend application.
