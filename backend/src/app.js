// app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/auth.routes");
const deviceRoutes = require("./routes/device.routes");
const telemetryRoutes = require("./routes/telemetry.routes");
const publicRoutes = require("./routes/public.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

// En producción solo se acepta el origen configurado en FRONTEND_URL; en
// desarrollo se refleja cualquier origen para no fricción con distintos puertos locales.
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// Panel de documentación técnica (Swagger), montado antes del helmet() global:
// su CSP por defecto bloquea el script inline que usa swagger-ui para arrancar.
app.use(
  "/api-docs",
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

app.use(helmet());

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/telemetry", telemetryRoutes);

// Servir landing estática y assets (APK, imágenes, etc.) desde /public
const path = require("path");
const publicDir = path.join(__dirname, "..", "public");

function publicUrl(req) {
  return (process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

app.get("/robots.txt", (req, res) => {
  const baseUrl = publicUrl(req);
  res.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

app.get("/sitemap.xml", (req, res) => {
  const baseUrl = publicUrl(req);
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}/</loc>\n  </url>\n</urlset>`,
  );
});

// Se conservan ambas URL públicas para la landing y para accesos directos.
app.use("/backend/public", express.static(publicDir));
app.use(express.static(publicDir));

// Servir los assets del frontend (iconos, imágenes) para usarlos en la landing y correos
const frontendAssets = path.join(__dirname, "..", "..", "frontend", "assets");
app.use("/assets", express.static(frontendAssets));
app.use("/frontend/assets", express.static(frontendAssets));

// Descarga pública del APK. `download` fuerza al navegador a tratarlo como archivo.
app.use(publicRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
