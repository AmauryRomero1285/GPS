const { Router } = require('express');
const deviceController = require('../controllers/device.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.post('/', deviceController.register);
router.get('/', deviceController.list);
router.delete('/:id', deviceController.remove);

module.exports = router;
