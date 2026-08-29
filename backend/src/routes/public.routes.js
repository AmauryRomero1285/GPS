const express = require("express");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

require("dotenv").config();

const router = express.Router();
const publicDir = path.join(__dirname, "..","..", "public");
const downloadDir = path.join(publicDir, "download");
const filePath = path.join(downloadDir, "locfar.apk");

// Variable global para controlar el estado de la primera descarga desde Drive
let isDownloadingFromDrive = false;

// Endpoint para consultar el estado del archivo
router.get("/download/status", (req, res) => {
  res.json({
    ready: fs.existsSync(filePath),
    downloading: isDownloadingFromDrive
  });
});

router.get("/download/locfar.apk", async (req, res) => {
  try {
    // 1. Si el archivo ya existe localmente, lo sirve de inmediato
    if (fs.existsSync(filePath)) {
      return res.download(filePath, "locfar.apk");
    }

    // Si se envía desde el navegador pidiendo solo confirmación previa
    if (req.query.checkOnly === "true") {
      if (!isDownloadingFromDrive) {
        // Iniciamos la descarga en segundo plano inmediatamente
        iniciarDescargaDrive();
      }
      return res.json({ status: "processing", ready: false });
    }

    // 2. Si es una petición de descarga directa pero no está listo ni descargando
    if (!isDownloadingFromDrive) {
      await iniciarDescargaDrive();
    }

    // Esperar a que se cree la transmisión si llegó justo durante el proceso
    const checkInterval = setInterval(() => {
      if (fs.existsSync(filePath)) {
        clearInterval(checkInterval);
        if (!res.headersSent) {
          res.download(filePath, "locfar.apk");
        }
      }
    }, 1000);

  } catch (error) {
    console.error("Error al obtener el archivo de Google Drive:", error.message);
    if (!res.headersSent) {
      res.status(500).send("No se pudo obtener el APK de Google Drive");
    }
  }
});

// Función auxiliar para descargar de Drive al almacenamiento local
async function iniciarDescargaDrive() {
  if (isDownloadingFromDrive) return;
  isDownloadingFromDrive = true;

  const fileId = process.env.DRIVE_FILE_ID;
  if (!fileId) throw new Error("ID de Google Drive no configurado en .env");

  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  const driveUrl = `https://drive.usercontent.google.com/download?id=${fileId}&confirm=t`;

  try {
    const response = await axios({
      method: "GET",
      url: driveUrl,
      responseType: "stream"
    });

    const tempFilePath = `${filePath}.tmp`;
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      fs.renameSync(tempFilePath, filePath);
      isDownloadingFromDrive = false;
    });

    writer.on("error", (err) => {
      console.error("Error guardando el APK:", err);
      isDownloadingFromDrive = false;
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    });

  } catch (err) {
    isDownloadingFromDrive = false;
    throw err;
  }
}

// Las rutas web inexistentes reciben HTML
router.use((req, res, next) => {
  if (req.method === "GET" && !req.originalUrl.startsWith("/api/")) {
    return res.status(404).sendFile(path.join(publicDir, "404.html"));
  }
  next();
});

module.exports = router;