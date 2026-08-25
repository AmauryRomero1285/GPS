const { Router } = require('express');
const deviceController = require('../controllers/device.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Registra un nuevo dispositivo (nodo ESP32) para el usuario autenticado
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, name]
 *             properties:
 *               id: { type: string, description: 'MAC o id único del ESP32', example: 'AA:BB:CC:DD:EE:FF' }
 *               name: { type: string, example: ESP32-Rastreador-1 }
 *     responses:
 *       201:
 *         description: Dispositivo registrado. El deviceToken solo se muestra en esta respuesta.
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
 *                     device: { $ref: '#/components/schemas/Device' }
 *                     deviceToken: { type: string, description: 'JWT de larga duración, solo se retorna una vez' }
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Ya existe un dispositivo con ese id
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/', deviceController.register);

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Lista los dispositivos propios del usuario autenticado
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dispositivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Device' }
 */
router.get('/', deviceController.list);

/**
 * @swagger
 * /devices/shared-with-me:
 *   get:
 *     summary: Lista los dispositivos que otros usuarios compartieron con el usuario autenticado
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dispositivos compartidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SharedDevice' }
 */
router.get('/shared-with-me', deviceController.listSharedWithMe);

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Elimina un dispositivo propio
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dispositivo eliminado correctamente
 *       403:
 *         description: El dispositivo no pertenece al usuario autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Dispositivo no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete('/:id', deviceController.remove);

/**
 * @swagger
 * /devices/{id}/shares:
 *   post:
 *     summary: Invita a otro usuario a acceder a un dispositivo propio (por correo)
 *     description: >
 *       No comparte de inmediato: crea una invitación con un token de un solo uso
 *       (expira en SHARE_INVITE_EXPIRES_HOURS, por defecto 72h) y la envía por correo.
 *       El destinatario debe iniciar sesión con esa cuenta y aceptarla en
 *       POST /devices/shares/{token}/accept.
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, description: 'Correo del usuario con quien compartir (debe tener cuenta registrada)' }
 *               permissionLevel: { type: string, enum: [READ_ONLY, FULL_ACCESS], default: READ_ONLY }
 *     responses:
 *       201:
 *         description: Invitación enviada por correo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/ShareInvitation' }
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: El dispositivo no pertenece al usuario autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Dispositivo o usuario destino no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: El dispositivo ya está compartido con ese usuario, o ya hay una invitación pendiente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/:id/shares', deviceController.invite);

/**
 * @swagger
 * /devices/shares/{token}/accept:
 *   post:
 *     summary: Acepta una invitación de compartición de dispositivo
 *     description: El usuario autenticado debe ser el mismo al que se invitó (mismo correo).
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invitación aceptada, acceso concedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/DeviceShare' }
 *       400:
 *         description: La invitación ha expirado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: La invitación no corresponde a la cuenta autenticada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Invitación no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: La invitación ya fue aceptada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/shares/:token/accept', deviceController.acceptInvitation);

/**
 * @swagger
 * /devices/{id}/shares:
 *   get:
 *     summary: Lista con quién se compartió un dispositivo propio
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de comparticiones del dispositivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/DeviceShare' }
 *       403:
 *         description: El dispositivo no pertenece al usuario autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:id/shares', deviceController.listShares);

/**
 * @swagger
 * /devices/{id}/shares/{shareId}:
 *   delete:
 *     summary: Revoca la compartición de un dispositivo propio
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Compartición revocada correctamente
 *       403:
 *         description: El dispositivo no pertenece al usuario autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Registro de compartición no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete('/:id/shares/:shareId', deviceController.revokeShare);

module.exports = router;
