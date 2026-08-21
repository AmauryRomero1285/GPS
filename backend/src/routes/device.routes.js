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
 *             required: [name]
 *             properties:
 *               name: { type: string, example: ESP32-Rastreador-1 }
 *     responses:
 *       201:
 *         description: Dispositivo registrado. La apiKey solo se muestra en esta respuesta.
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
 *                     apiKey: { type: string, description: 'Clave en texto plano, solo se retorna una vez' }
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/', deviceController.register);

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Lista los dispositivos del usuario autenticado
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
 *         schema: { type: string, format: uuid }
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

module.exports = router;
