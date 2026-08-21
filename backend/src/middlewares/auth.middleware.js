const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      status: 'error',
      message: 'Token de autenticación requerido.',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token de autenticación inválido o expirado.',
    });
  }
}

module.exports = { authenticate };
