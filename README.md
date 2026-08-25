# GPS

Sistema de rastreo GPS: un nodo ESP32 envía coordenadas al backend, que las
persiste y las expone en tiempo real (HTTP + WebSocket) a una app móvil.

- **`backend/`** — API REST + WebSocket (Express, PostgreSQL para usuarios/dispositivos,
  MongoDB para telemetría). Ver [backend/README.md](backend/README.md) y la
  justificación de arquitectura en [backend/docs/README.md](backend/docs/README.md).
- **`frontend/`** — App móvil (Expo + React Native + TypeScript, Expo Router).
  Ver la justificación de arquitectura en [frontend/docs/README.md](frontend/docs/README.md).
- **`arduino/`** — Firmware del nodo ESP32 (aún no implementado).

## Arranque rápido

```
# Backend
cd backend
pnpm install
cp .env.example .env   # completar credenciales reales
psql -d <tu_db> -f src/config/schema.sql
pnpm dev                # http://localhost:4000, panel Swagger en /api-docs

# Frontend
cd frontend
pnpm install
echo "EXPO_PUBLIC_API_URL=http://<tu-ip-lan>:4000/api" > .env
pnpm start
```

Detalles de configuración (variables de entorno, IP de LAN vs. localhost,
generación del .apk) en [frontend/docs/README.md](frontend/docs/README.md).
