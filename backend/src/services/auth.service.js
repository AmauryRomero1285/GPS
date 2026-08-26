const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/sql/user.repository');
const mailService = require('./mail.service');

const EMAIL_VERIFICATION_EXPIRES_HOURS = Number(process.env.EMAIL_VERIFICATION_EXPIRES_HOURS) || 24;

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, isVerified: user.is_verified },
    process.env.JWT_SECRET || 'super_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET || 'super_secret_refresh_key',
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );
}

// Emite y envía un nuevo token de verificación, invalidando cualquier token
// previo del usuario (así solo el más reciente enviado por correo es válido).
async function issueVerificationToken(user) {
  await userRepository.deleteVerificationTokensForUser(user.id);

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000);

  await userRepository.saveVerificationToken(user.id, verificationToken, expiresAt);
  await mailService.sendVerificationEmail(user, verificationToken);

  return verificationToken;
}

function validatePasswordComplexity(password) {
  if (!password || typeof password !== 'string') return false;
  if (password.length <= 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

class AuthService {
  // 1. Registro de Usuario
  async register({ email, username, password, name, lastname }) {
    if (!validatePasswordComplexity(password)) {
      const error = new Error('La contraseña debe tener más de 8 caracteres, al menos una mayúscula, un número y un símbolo especial.');
      error.statusCode = 400;
      throw error;
    }

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
      lastname,
    });

    const verificationToken = await issueVerificationToken(newUser);

    return {
      user: newUser,
      // Solo se expone en desarrollo, para poder probar sin bandeja de correo real.
      ...(process.env.NODE_ENV !== 'production' ? { verificationToken } : {}),
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

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        lastname: user.lastname,
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

  // 4. Reenvío del token de verificación (p.ej. si el original expiró)
  async resendVerification(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('No existe una cuenta con ese correo.');
      error.statusCode = 404;
      throw error;
    }

    if (user.is_verified) {
      const error = new Error('Esta cuenta ya está verificada.');
      error.statusCode = 400;
      throw error;
    }

    const verificationToken = await issueVerificationToken(user);

    return {
      ...(process.env.NODE_ENV !== 'production' ? { verificationToken } : {}),
    };
  }

  // 5. Renovación del access token a partir de un refresh token
  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'super_secret_refresh_key');
    } catch (error) {
      const err = new Error('Refresh token inválido o expirado.');
      err.statusCode = 401;
      throw err;
    }

    if (payload.type !== 'refresh') {
      const error = new Error('Refresh token inválido.');
      error.statusCode = 401;
      throw error;
    }

    const user = await userRepository.findById(payload.id);
    if (!user || !user.is_active) {
      const error = new Error('Usuario no encontrado o inactivo.');
      error.statusCode = 401;
      throw error;
    }

    const accessToken = signAccessToken(user);

    return { accessToken };
  }

  // 6. Solicitud de recuperación de contraseña (Forgot Password)
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('No existe una cuenta con ese correo electrónico.');
      error.statusCode = 404;
      throw error;
    }

    await userRepository.deletePasswordResetTokensForUser(user.id);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validez

    await userRepository.savePasswordResetToken(user.id, resetToken, expiresAt);
    await mailService.sendPasswordResetEmail(user, resetToken);

    return {
      ...(process.env.NODE_ENV !== 'production' ? { resetToken } : {}),
    };
  }

  // 7. Restablecimiento de contraseña (Reset Password)
  async resetPassword({ token, newPassword }) {
    if (!validatePasswordComplexity(newPassword)) {
      const error = new Error('La contraseña debe tener más de 8 caracteres, al menos una mayúscula, un número y un símbolo especial.');
      error.statusCode = 400;
      throw error;
    }

    const resetRecord = await userRepository.findPasswordResetToken(token);
    if (!resetRecord) {
      const error = new Error('El código o token de recuperación es inválido.');
      error.statusCode = 400;
      throw error;
    }

    if (resetRecord.used_at) {
      const error = new Error('Este código de recuperación ya ha sido utilizado.');
      error.statusCode = 400;
      throw error;
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      const error = new Error('El código de recuperación ha expirado.');
      error.statusCode = 400;
      throw error;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await userRepository.updatePassword(resetRecord.user_id, passwordHash);
    await userRepository.markPasswordResetTokenUsed(token);

    return {
      message: 'Contraseña actualizada correctamente.',
    };
  }
}

module.exports = new AuthService();
