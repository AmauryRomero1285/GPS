const express = require("express");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const router = express.Router();

// Definición de rutas directas a la carpeta pública
const publicDir = path.join(__dirname, "..", "..", "public");
const downloadDir = path.join(publicDir, "download");
const filePath = path.join(downloadDir, "locfar.apk");

/**
 * Endpoint para verificar si el APK existe en el servidor
 * GET /download/status
 */
router.get("/download/status", (req, res) => {
  const exists = fs.existsSync(filePath);
  res.json({
    ready: exists,
    downloading: false
  });
});

/**
 * Endpoint principal de descarga directa del APK
 * GET /download/locfar.apk
 */
router.get("/download/locfar.apk", (req, res) => {
  // Verificar disponibilidad del archivo local
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: "El archivo APK no se encuentra disponible en el servidor."
    });
  }

  // Desactivar caché para asegurar que descarguen la última versión si la reemplazas
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Servir el archivo forzando la descarga
  res.download(filePath, "locfar.apk", (err) => {
    if (err && !res.headersSent) {
      console.error("Error al transmitir el APK:", err.message);
      res.status(500).send("Error al descargar el archivo.");
    }
  });
});

/**
 * Manejo de rutas web no encontradas (HTML 404)
 */
router.use((req, res, next) => {
  if (req.method === "GET" && !req.originalUrl.startsWith("/api/")) {
    const notFoundPath = path.join(publicDir, "404.html");
    if (fs.existsSync(notFoundPath)) {
      return res.status(404).sendFile(notFoundPath);
    }
    return res.status(404).send("Página no encontrada");
  }
  next();
});

module.exports = router;