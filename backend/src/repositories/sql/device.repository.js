const db = require('../../config/db.sql');

class DeviceRepository {
  async create({ id, ownerId, name }) {
    const query = `
      INSERT INTO devices (id, owner_id, name)
      VALUES ($1, $2, $3)
      RETURNING id, owner_id, name, is_active, created_at;
    `;
    const { rows } = await db.query(query, [id, ownerId, name]);
    return rows[0];
  }

  async findById(id) {
    const query = 'SELECT id, owner_id, name, is_active, created_at FROM devices WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  async listByOwner(ownerId) {
    const query = 'SELECT id, owner_id, name, is_active, created_at FROM devices WHERE owner_id = $1 ORDER BY created_at DESC';
    const { rows } = await db.query(query, [ownerId]);
    return rows;
  }

  async delete(id) {
    const query = 'DELETE FROM devices WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new DeviceRepository();
