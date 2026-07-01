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
  const host = req.headers.host || '';

  // Very basic extraction of subdomain.
  // If host is subdomain.localhost:3000 or subdomain.mydomain.com
  // We assume the first part before the first dot is the subdomain.
  // This is a naive approach for this quickhost proof-of-concept.
  const parts = host.split('.');

  // If no subdomain (e.g., localhost:3000 or 127.0.0.1:3000), skip to next middleware (API or Frontend)
  if (parts.length === 1 || (parts.length === 2 && parts[0] === 'localhost') || host.startsWith('127.0.0.1')) {
    return next();
  }

  // The first part is assumed to be the subdomain
  const subdomain = parts[0];

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
