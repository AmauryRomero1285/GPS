const { Router } = require('express');
const telemetryController = require('../controllers/telemetry.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authenticateDevice } = require('../middlewares/device-auth.middleware');

const router = Router();

/**
 * @swagger
 * /telemetry:
 *   post:
 *     summary: Ingesta un nuevo punto de telemetría GPS (usado por el nodo ESP32)
 *     tags: [Telemetry]
 *     security:
 *       - deviceAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TelemetryIngestInput' }
 *     responses:
 *       201:
 *         description: Telemetría registrada y transmitida en tiempo real vía WebSocket
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/TelemetryPoint' }
 *       400:
 *         description: Coordenadas inválidas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Token de dispositivo ausente, inválido, expirado o dispositivo inactivo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/', authenticateDevice, telemetryController.ingest);

/**
 * @swagger
 * /telemetry/{deviceId}/latest:
 *   get:
 *     summary: Obtiene el último punto de telemetría de un dispositivo propio
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Último punto de telemetría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/TelemetryPoint' }
 *       403:
 *         description: El usuario autenticado no es dueño ni tiene el dispositivo compartido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Dispositivo no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:deviceId/latest', authenticate, telemetryController.latest);

/**
 * @swagger
 * /telemetry/{deviceId}/history:
 *   get:
 *     summary: Obtiene el historial de telemetría de un dispositivo propio
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *         description: Filtra puntos con recordedAt >= from
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *         description: Filtra puntos con recordedAt <= to
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 100, maximum: 1000 }
 *     responses:
 *       200:
 *         description: Historial de telemetría, ordenado del más reciente al más antiguo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/TelemetryPoint' }
 *       403:
 *         description: El usuario autenticado no es dueño ni tiene el dispositivo compartido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Dispositivo no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:deviceId/history', authenticate, telemetryController.history);

module.exports = router;
