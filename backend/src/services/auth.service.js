const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/sql/user.repository');

class AuthService {
  // 1. Registro de Usuario
  async register({ email, username, password, name }) {
    // Validar si el usuario o email ya existen
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('El correo electrónico ya está registrado.');
      error.statusCode = 400;
      throw error;
    }

    // Hashear contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario en BD
    const newUser = await userRepository.createUser({
      email,
      username,
      passwordHash,
      name,
    });

    // Generar token para verificación de email (expira en 24h)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await userRepository.saveVerificationToken(
      newUser.id,
      verificationToken,
      expiresAt
    );

    // TODO: Aquí se invocaría un servicio de envío de correos (Nodemailer, SendGrid, etc.)
    
    return {
      user: newUser,
      verificationToken, // Se retorna para pruebas tempranas / desarrollo
    };
  }

  // 2. Inicio de Sesión
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Credenciales inválidas.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('La cuenta se encuentra desactivada.');
      error.statusCode = 403;
      throw error;
    }

    // Validar hash de contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const error = new Error('Credenciales inválidas.');
      error.statusCode = 401;
      throw error;
    }

    // Generar JWT
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      isVerified: user.is_verified,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_key', {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        isVerified: user.is_verified,
      },
    };
  }

  // 3. Verificación de Correo
  async verifyEmail(token) {
    const verification = await userRepository.findVerificationToken(token);
    if (!verification) {
      const error = new Error('Token de verificación inválido.');
      error.statusCode = 400;
      throw error;
    }

    if (new Date(verification.expires_at) < new Date()) {
      const error = new Error('El token de verificación ha expirado.');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.verifyUser(verification.user_id);
    return user;
  }
}

module.exports = new AuthService();