const db = require('../../config/db.sql');

class DeviceRepository {
  async create({ userId, name, apiKeyHash }) {
    const query = `
      INSERT INTO devices (user_id, name, api_key_hash)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, name, status, last_seen_at, created_at;
    `;
    const { rows } = await db.query(query, [userId, name, apiKeyHash]);
    return rows[0];
  }

  async findById(id) {
    const query = 'SELECT id, user_id, name, status, last_seen_at, created_at FROM devices WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  async findByApiKeyHash(apiKeyHash) {
    const query = 'SELECT * FROM devices WHERE api_key_hash = $1';
    const { rows } = await db.query(query, [apiKeyHash]);
    return rows[0] || null;
  }

  async listByUser(userId) {
    const query = 'SELECT id, user_id, name, status, last_seen_at, created_at FROM devices WHERE user_id = $1 ORDER BY created_at DESC';
    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  async touchLastSeen(id) {
    const query = 'UPDATE devices SET last_seen_at = CURRENT_TIMESTAMP WHERE id = $1';
    await db.query(query, [id]);
  }

  async delete(id) {
    const query = 'DELETE FROM devices WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new DeviceRepository();
