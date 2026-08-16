const { pool } = require('../config/db');

async function getPublishedAnnouncements() {
  const [rows] = await pool.execute(
    'SELECT id, title, content, created_at FROM announcements WHERE is_published = TRUE ORDER BY created_at DESC'
  );

  return rows;
}

async function createAnnouncement({ title, content }) {
  const [result] = await pool.execute(
    'INSERT INTO announcements (title, content, is_published) VALUES (?, ?, TRUE)',
    [title, content]
  );

  return result;
}

module.exports = {
  getPublishedAnnouncements,
  createAnnouncement,
};
