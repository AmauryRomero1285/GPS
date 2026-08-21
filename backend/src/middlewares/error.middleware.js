function notFound(req, res) {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Error interno del servidor.' : err.message,
  });
}

module.exports = { notFound, errorHandler };
