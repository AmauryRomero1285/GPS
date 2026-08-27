const express = require("express");
const path = require("path");

const router = express.Router();
const publicDir = path.join(__dirname, "..", "..", "public");

router.get("/download/locfar.apk", (req, res) => {
  const filePath = path.join(publicDir, "download", "locfar.apk");
  
  res.download(filePath, "locfar.apk", {
    headers: {
      "Content-Type": "application/vnd.android.package-archive"
    }
  }, (error) => {
    if (error && !res.headersSent) {
      res.status(error.code === "ENOENT" ? 404 : 500).send("APK no disponible");
    }
  });
});

// Las rutas web inexistentes reciben HTML
router.use((req, res, next) => {
  if (req.method === "GET" && !req.originalUrl.startsWith("/api/")) {
    return res.status(404).sendFile(path.join(publicDir, "404.html"));
  }
  next();
});

module.exports = router;