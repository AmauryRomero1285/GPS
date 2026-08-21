// swagger.js
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 4000;

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'GPS Tracker API',
    version: '1.0.0',
    description:
      'API para recibir telemetría GPS de un nodo ESP32, gestionar usuarios/dispositivos y exponer los datos en tiempo real. ' +
      'Persistencia políglota: PostgreSQL para usuarios y dispositivos, MongoDB para telemetría.',
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api`,
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Registro, inicio de sesión y verificación de cuenta' },
    { name: 'Devices', description: 'Registro y administración de dispositivos (nodos ESP32)' },
    { name: 'Telemetry', description: 'Ingesta y consulta de coordenadas GPS' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido en /auth/login. Usado por el cliente web.',
      },
      deviceAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT de dispositivo entregado una única vez al registrarlo. Usado por el nodo ESP32.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
          name: { type: 'string' },
          lastname: { type: 'string' },
          is_verified: { type: 'boolean' },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Device: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MAC o id único del ESP32', example: 'AA:BB:CC:DD:EE:FF' },
          owner_id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      DeviceShare: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          device_id: { type: 'string' },
          permission_level: { type: 'string', enum: ['READ_ONLY', 'FULL_ACCESS'] },
          created_at: { type: 'string', format: 'date-time' },
          user_id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
        },
      },
      ShareInvitation: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          device_id: { type: 'string' },
          invited_by_user_id: { type: 'string', format: 'uuid' },
          invited_email: { type: 'string', format: 'email' },
          permission_level: { type: 'string', enum: ['READ_ONLY', 'FULL_ACCESS'] },
          expires_at: { type: 'string', format: 'date-time' },
          accepted_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      SharedDevice: {
        type: 'object',
        properties: {
          share_id: { type: 'string', format: 'uuid' },
          permission_level: { type: 'string', enum: ['READ_ONLY', 'FULL_ACCESS'] },
          shared_at: { type: 'string', format: 'date-time' },
          id: { type: 'string' },
          owner_id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      TelemetryPoint: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          deviceId: { type: 'string', format: 'uuid' },
          location: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['Point'] },
              coordinates: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2,
                description: '[longitude, latitude]',
              },
            },
          },
          altitude: { type: 'number', nullable: true },
          speed: { type: 'number', nullable: true },
          satellites: { type: 'integer', nullable: true },
          recordedAt: { type: 'string', format: 'date-time' },
          receivedAt: { type: 'string', format: 'date-time' },
        },
      },
      TelemetryIngestInput: {
        type: 'object',
        required: ['latitude', 'longitude'],
        properties: {
          latitude: { type: 'number', minimum: -90, maximum: 90, example: 19.4326 },
          longitude: { type: 'number', minimum: -180, maximum: 180, example: -99.1332 },
          altitude: { type: 'number', example: 2250 },
          speed: { type: 'number', example: 12.5 },
          satellites: { type: 'integer', example: 8 },
          recordedAt: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string' },
        },
      },
    },
  },
};

const options = {
  definition,
  apis: [path.join(__dirname, '../routes/*.routes.js')],
};

module.exports = swaggerJsdoc(options);
