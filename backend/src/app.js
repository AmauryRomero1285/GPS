// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/auth.routes');
const deviceRoutes = require('./routes/device.routes');
const telemetryRoutes = require('./routes/telemetry.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// En producción solo se acepta el origen configurado en FRONTEND_URL; en
// desarrollo se refleja cualquier origen para no fricción con distintos puertos locales.
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true }));
app.use(express.json());
app.use(morgan('dev'));

// Panel de documentación técnica (Swagger), montado antes del helmet() global:
// su CSP por defecto bloquea el script inline que usa swagger-ui para arrancar.
app.use('/api-docs', helmet({ contentSecurityPolicy: false }), swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use(helmet());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/telemetry', telemetryRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
