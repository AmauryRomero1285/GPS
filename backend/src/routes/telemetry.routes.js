const { Router } = require('express');
const telemetryController = require('../controllers/telemetry.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authenticateDevice } = require('../middlewares/device-auth.middleware');

const router = Router();

// El ESP32 empuja telemetría autenticado con su API key de dispositivo.
router.post('/', authenticateDevice, telemetryController.ingest);

// El cliente web consulta telemetría autenticado como usuario dueño del dispositivo.
router.get('/:deviceId/latest', authenticate, telemetryController.latest);
router.get('/:deviceId/history', authenticate, telemetryController.history);

module.exports = router;
