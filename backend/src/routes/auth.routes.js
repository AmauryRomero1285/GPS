const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password, name, lastname]
 *             properties:
 *               email: { type: string, format: email }
 *               username: { type: string }
 *               password: { type: string, format: password }
 *               name: { type: string }
 *               lastname: { type: string }
 *     responses:
 *       201:
 *         description: Usuario registrado, pendiente de verificación de correo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *                     verificationToken:
 *                       type: string
 *                       description: 'Solo presente cuando NODE_ENV != production; en producción el link de verificación se envía por correo.'
 *       400:
 *         description: Datos inválidos o correo ya registrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y obtiene un access token y un refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken: { type: string, description: 'JWT de corta duración (JWT_EXPIRES_IN, default 8h)' }
 *                     refreshToken: { type: string, description: 'JWT de larga duración (REFRESH_TOKEN_EXPIRES_IN, default 30d)' }
 *                     user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: La cuenta aún no fue verificada/activada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renueva el access token a partir de un refresh token vigente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Nuevo access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken: { type: string }
 *       401:
 *         description: Refresh token ausente, inválido, expirado, o usuario inactivo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenvía el correo de verificación (p.ej. si el token original expiró)
 *     description: >
 *       Busca la cuenta por correo; si existe y aún no está verificada, invalida
 *       cualquier token de verificación previo, emite uno nuevo (válido por
 *       EMAIL_VERIFICATION_EXPIRES_HOURS) y lo reenvía por correo.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Se envió un nuevo correo de verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     verificationToken:
 *                       type: string
 *                       description: 'Solo presente cuando NODE_ENV != production'
 *       400:
 *         description: Correo faltante, o la cuenta ya está verificada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: No existe una cuenta con ese correo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/resend-verification', authController.resendVerification);

/**
 * @swagger
 * /auth/verify/{token}:
 *   get:
 *     summary: Verifica el correo de un usuario con el token enviado en el registro
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Correo verificado correctamente
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/verify/:token', authController.verifyEmail);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Token ausente o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/me', authenticate, authController.me);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita un enlace/código de restablecimiento de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Se envió el correo de recuperación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     resetToken:
 *                       type: string
 *                       description: 'Solo presente cuando NODE_ENV != production'
 *       400:
 *         description: Correo faltante
 *       404:
 *         description: No existe una cuenta con ese correo
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablece la contraseña utilizando el token recibido
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Contraseña restablecida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *       400:
 *         description: Token inválido, expirado, ya utilizado o contraseña insegura
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;

