const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, username, password, name } = req.body;

      if (!email || !username || !password || !name) {
        return res.status(400).json({
          status: 'error',
          message: 'Todos los campos son obligatorios.',
        });
      }

      const result = await authService.register({ email, username, password, name });

      return res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente. Por favor verifica tu correo.',
        data: result,
      });
    } catch (error) {
      next(error); 
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Correo y contraseña son requeridos.',
        });
      }

      const result = await authService.login({ email, password });

      return res.status(200).json({
        status: 'success',
        message: 'Sesión iniciada correctamente.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();