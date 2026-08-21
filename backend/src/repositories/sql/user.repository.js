const db = require('../../config/db.sql');

class UserRepository {
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0] || null;
  }

  async findById(id) {
    const query = 'SELECT id, email, username, name, lastname, is_verified, is_active, created_at FROM users WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  async createUser({ email, username, passwordHash, name, lastname }) {
    const query = `
      INSERT INTO users (email, username, password_hash, name, lastname)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, name, lastname, is_verified, is_active, created_at;
    `;
    const values = [email, username, passwordHash, name, lastname];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async saveVerificationToken(userId, token, expiresAt) {
    const query = `
      INSERT INTO email_verifications (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, token, expires_at;
    `;
    const { rows } = await db.query(query, [userId, token, expiresAt]);
    return rows[0];
  }

  async verifyUser(userId) {
    // La verificación de correo activa la cuenta: is_active nace en FALSE.
    const query = `
      UPDATE users
      SET is_verified = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, is_verified, is_active;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows[0];
  }

  async findVerificationToken(token) {
    const query = 'SELECT * FROM email_verifications WHERE token = $1';
    const { rows } = await db.query(query, [token]);
    return rows[0] || null;
  }

  async deleteVerificationTokensForUser(userId) {
    await db.query('DELETE FROM email_verifications WHERE user_id = $1', [userId]);
  }
}

module.exports = new UserRepository();
