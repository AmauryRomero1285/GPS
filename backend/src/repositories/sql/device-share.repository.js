const db = require('../../config/db.sql');

class DeviceShareRepository {
  async create({ deviceId, sharedWithUserId, permissionLevel }) {
    const query = `
      INSERT INTO device_shares (device_id, shared_with_user_id, permission_level)
      VALUES ($1, $2, $3)
      RETURNING id, device_id, shared_with_user_id, permission_level, created_at;
    `;
    const { rows } = await db.query(query, [deviceId, sharedWithUserId, permissionLevel]);
    return rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM device_shares WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  async findByDeviceAndUser(deviceId, userId) {
    const query = 'SELECT * FROM device_shares WHERE device_id = $1 AND shared_with_user_id = $2';
    const { rows } = await db.query(query, [deviceId, userId]);
    return rows[0] || null;
  }

  async listByDevice(deviceId) {
    const query = `
      SELECT ds.id, ds.device_id, ds.permission_level, ds.created_at,
             u.id AS user_id, u.email, u.username, u.name, u.lastname
      FROM device_shares ds
      JOIN users u ON u.id = ds.shared_with_user_id
      WHERE ds.device_id = $1
      ORDER BY ds.created_at DESC;
    `;
    const { rows } = await db.query(query, [deviceId]);
    return rows;
  }

  async listByUser(userId) {
    const query = `
      SELECT ds.id AS share_id, ds.permission_level, ds.created_at AS shared_at,
             d.id, d.owner_id, d.name, d.is_active, d.created_at
      FROM device_shares ds
      JOIN devices d ON d.id = ds.device_id
      WHERE ds.shared_with_user_id = $1
      ORDER BY ds.created_at DESC;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  async delete(id) {
    const query = 'DELETE FROM device_shares WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new DeviceShareRepository();
