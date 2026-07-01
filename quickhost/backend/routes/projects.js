const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all projects
router.get('/', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new project
router.post('/', (req, res) => {
  const { name, subdomain } = req.body;

  if (!name || !subdomain) {
    return res.status(400).json({ error: 'Name and subdomain are required' });
  }

  try {
    const stmt = db.prepare('INSERT INTO projects (name, subdomain) VALUES (?, ?)');
    const info = stmt.run(name, subdomain);

    // Create a default index.html for the new project
    const fileStmt = db.prepare('INSERT INTO files (project_id, path, content) VALUES (?, ?, ?)');
    fileStmt.run(info.lastInsertRowid, '/index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f0f0; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Welcome to ${name}</h1>
  <p>Your new site is ready to be edited.</p>
</body>
</html>`);

    res.status(201).json({ id: info.lastInsertRowid, name, subdomain });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Subdomain already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
router.get('/:id', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
