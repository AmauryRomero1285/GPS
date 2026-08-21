const db = require('../../config/db.sql');

class DeviceShareInvitationRepository {
  async create({ deviceId, invitedByUserId, invitedEmail, permissionLevel, token, expiresAt }) {
    const query = `
      INSERT INTO device_share_invitations (device_id, invited_by_user_id, invited_email, permission_level, token, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, device_id, invited_by_user_id, invited_email, permission_level, token, expires_at, accepted_at, created_at;
    `;
    const values = [deviceId, invitedByUserId, invitedEmail, permissionLevel, token, expiresAt];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async findByToken(token) {
    const query = 'SELECT * FROM device_share_invitations WHERE token = $1';
    const { rows } = await db.query(query, [token]);
    return rows[0] || null;
  }

  async findPending(deviceId, email) {
    const query = `
      SELECT * FROM device_share_invitations
      WHERE device_id = $1 AND invited_email = $2 AND accepted_at IS NULL AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1;
    `;
    const { rows } = await db.query(query, [deviceId, email]);
    return rows[0] || null;
  }

  async markAccepted(id) {
    const query = 'UPDATE device_share_invitations SET accepted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, accepted_at';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = new DeviceShareInvitationRepository();
