const express = require('express');
const router = express.Router({ mergeParams: true }); // Important: merge params to get projectId from parent router
const db = require('../db');

// Get all files for a project (metadata only, not content)
router.get('/', (req, res) => {
  const { projectId } = req.params;
  try {
    const files = db.prepare('SELECT id, project_id, path, created_at, updated_at FROM files WHERE project_id = ? ORDER BY path ASC').all(projectId);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get content of a specific file
router.get('/content', (req, res) => {
  const { projectId } = req.params;
  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'File path query parameter is required' });
  }

  try {
    const file = db.prepare('SELECT content FROM files WHERE project_id = ? AND path = ?').get(projectId, path);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ content: file.content || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update a file
router.put('/', (req, res) => {
  const { projectId } = req.params;
  const { path, content } = req.body;

  if (!path) {
    return res.status(400).json({ error: 'File path is required' });
  }

  try {
    // Upsert the file
    const stmt = db.prepare(`
      INSERT INTO files (project_id, path, content, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(project_id, path)
      DO UPDATE SET content = excluded.content, updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(projectId, path, content || '');

    res.json({ success: true, path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a file
router.delete('/', (req, res) => {
  const { projectId } = req.params;
  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'File path query parameter is required' });
  }

  try {
    const info = db.prepare('DELETE FROM files WHERE project_id = ? AND path = ?').run(projectId, path);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
