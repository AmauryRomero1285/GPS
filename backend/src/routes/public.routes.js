const express = require("express");
const path = require("path");

const router = express.Router();
const publicDir = path.join(__dirname, "..", "..", "public");

// El APK se aloja en backend/public, no en los recursos del frontend.
router.get("/download/locfar.apk", (req, res) => {
  res.download(path.join(publicDir, "locfar.apk"), "locfar.apk", (error) => {
    if (error && !res.headersSent) {
      res.status(error.code === "ENOENT" ? 404 : 500).send("APK no disponible");
    }
  });
});

// Las rutas web inexistentes reciben HTML; las API conservan la respuesta JSON.
router.use((req, res, next) => {
  if (req.method === "GET" && !req.originalUrl.startsWith("/api/")) {
    return res.status(404).sendFile(path.join(publicDir, "404.html"));
  }
  next();
});

module.exports = router;
