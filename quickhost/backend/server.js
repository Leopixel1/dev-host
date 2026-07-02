const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db');
const projectsRouter = require('./routes/projects');
const filesRouter = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/files/:projectId', filesRouter); // Mount files router with projectId param

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const mime = require('mime-types');

// Wildcard subdomain routing
app.use((req, res, next) => {
  const hostWithPort = req.headers.host || '';
  const host = hostWithPort.split(':')[0];

  // Get base domain from environment or default to localhost
  const baseDomain = process.env.BASE_DOMAIN || 'localhost';

  // If it's the base domain or an IP, it's the main dashboard
  if (host === baseDomain || host === '127.0.0.1' || host === 'localhost') {
    return next();
  }

  // Check if the host ends with the base domain
  if (!host.endsWith('.' + baseDomain)) {
    return next();
  }

  // Extract the subdomain part
  const subdomain = host.slice(0, -(baseDomain.length + 1));

  if (!subdomain) {
    return next();
  }

  try {
    // Look up the project by subdomain
    const project = db.prepare('SELECT id FROM projects WHERE subdomain = ?').get(subdomain);

    if (!project) {
      // Subdomain not found, continue to normal routing (might be a 404 or the main site if they mapped incorrectly)
      return next();
    }

    // Determine the requested file path
    let requestPath = req.path;
    if (requestPath === '/') {
      requestPath = '/index.html';
    }

    // Get the file content from the database
    const file = db.prepare('SELECT content FROM files WHERE project_id = ? AND path = ?').get(project.id, requestPath);

    if (file) {
      // Determine content type based on file extension
      const contentType = mime.lookup(requestPath) || 'text/plain';
      res.setHeader('Content-Type', contentType);
      return res.send(file.content);
    } else {
      return res.status(404).send('404 Not Found - File does not exist in this project.');
    }
  } catch (error) {
    console.error('Subdomain routing error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// Serve the static frontend build for requests that didn't match a subdomain or /api
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// For React Router, catch all other requests and send index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
