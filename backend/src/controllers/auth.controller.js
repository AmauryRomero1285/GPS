const authService = require('../services/auth.service');
const userRepository = require('../repositories/sql/user.repository');
const fs = require("fs");
const path = require("path");

// Carga de platillas HTML

function renderTemplate(templateName, variables = {}){
  const temaplatePath = path.join(__dirname, "..", "templates", `${templateName}.html`);
  let content = fs.readFileSync(temaplatePath,"utf8");

  Object.keys(variables).forEach((key)=>{
    const regex = new RegExp(`{{${key}}`, "g");
    content = content.replace(regex,variables[key] || "");
  });
return content;
};


class AuthController {
  async register(req, res, next) {
    try {
      const { email, username, password, name, lastname } = req.body;

      if (!email || !username || !password || !name || !lastname) {
        return res.status(400).json({
          status: 'error',
          message: 'Todos los campos son obligatorios.',
        });
      }

      const result = await authService.register({ email, username, password, name, lastname });

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

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          status: 'error',
          message: 'refreshToken es obligatorio.',
        });
      }

      const result = await authService.refresh(refreshToken);

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'El correo es obligatorio.',
        });
      }

      const result = await authService.resendVerification(email);

      return res.status(200).json({
        status: 'success',
        message: 'Se envió un nuevo correo de verificación.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;

      // Realiza la lógica de verificación en la BD
      const user = await authService.verifyEmail(token);

      // Renderiza la plantilla HTML de confirmación
      const html = renderTemplate("account-verified", {
        userName: user.name,
      });

      // Se responde enviando el HTML renderizado directamente al navegador
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuario no encontrado.',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'El correo electrónico es obligatorio.',
        });
      }

      const result = await authService.forgotPassword(email);

      return res.status(200).json({
        status: 'success',
        message: 'Se ha enviado un enlace/código de recuperación a tu correo.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'El código/token y la nueva contraseña son requeridos.',
        });
      }

      const result = await authService.resetPassword({ token, newPassword });

      return res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
