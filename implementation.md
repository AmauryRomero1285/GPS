# Plan de Implementación: Landing Page de Descarga de APK, Nuevo Icono, Charging Page y Tema Blanco & Negro (Claro y Oscuro)

Este plan detalla los pasos para transformar la identidad visual y la experiencia de usuario de la aplicación GPS, además de proveer la plataforma web (Landing Page) para su distribución y descarga del APK.

---

## 1. Procesamiento del Icono y Assets de la Aplicación
- Extraer con alta resolución el logo circular provisto por el usuario desde la imagen adjunta.
- Generar versiones optimizadas en formato PNG con canal alfa y resoluciones estándar para Expo / Android:
  - `frontend/assets/icon.png` (1024x1024)
  - `frontend/assets/splash-icon.png` (512x512)
  - `frontend/assets/android-icon-foreground.png` (432x432 adaptive foreground)
  - `frontend/assets/android-icon-background.png` (adaptive background)
  - `frontend/assets/android-icon-monochrome.png` (icono monocromático para Android 13+)
- Configurar [frontend/app.json](file:///c:/Users/Dev/GPS/frontend/app.json) con los nombres de la app, iconos adaptativos y configuración de splash screen.

---

## 2. Charging Page (Pantalla de Carga Inicial)
- Crear el componente `frontend/src/components/ChargingScreen.tsx`:
  - Visualización del nuevo icono central con animación de ondas de radar pulsantes concéntricas (efecto visual de localización GPS).
  - Barra de progreso de carga y estados textuales dinámicos ("Iniciando GPS Tracker...", "Verificando credenciales...", "Sincronizando telemetría...", "Listo").
  - Transición fluida (fade-out) hacia la pantalla de autenticación o el mapa principal una vez completada la hidratación del estado (`AuthFacade.hydrate()`).
  - Adaptabilidad total a los temas Claro y Oscuro.
- Integrar la `ChargingScreen` en [frontend/app/_layout.tsx](file:///c:/Users/Dev/GPS/frontend/app/_layout.tsx).

---

## 3. Sistema de Tema Blanco y Negro (Modos Claro y Oscuro)
- Redefinir la paleta en [frontend/src/theme/colors.ts](file:///c:/Users/Dev/GPS/frontend/src/theme/colors.ts):
  - **Modo Blanco y Negro Claro**: Fondo blanco puro (`#FFFFFF`), superficies en grises claros sutiles (`#F4F4F5`), textos en negro profundo (`#09090B`), botones principales en negro con texto blanco en contraste.
  - **Modo Blanco y Negro Oscuro**: Fondo negro OLED (`#000000`), superficies oscuras (`#121214`), bordes zinc sutiles (`#27272A`), textos en blanco puro (`#FAFAFA`), botones principales en blanco con texto negro en contraste.
- Crear un store de tema dinámico `frontend/src/store/themeStore.ts` con persistencia en almacenamiento seguro y detección automática del tema del sistema (`'system' | 'light' | 'dark'`).
- Actualizar los componentes principales ([Screen.tsx](file:///c:/Users/Dev/GPS/frontend/src/components/Screen.tsx), [Button.tsx](file:///c:/Users/Dev/GPS/frontend/src/components/Button.tsx), [TextField.tsx](file:///c:/Users/Dev/GPS/frontend/src/components/TextField.tsx), [Badge.tsx](file:///c:/Users/Dev/GPS/frontend/src/components/Badge.tsx), [TextLink.tsx](file:///c:/Users/Dev/GPS/frontend/src/components/TextLink.tsx), [MapAdapter.tsx](file:///c:/Users/Dev/GPS/frontend/src/components/MapAdapter.tsx), [ConnectionIndicator.tsx](file:///c:/Users/Dev/GPS/frontend/src/components/ConnectionIndicator.tsx)) para reaccionar al tema activo.
- Añadir en [frontend/app/(app)/profile.tsx](file:///c:/Users/Dev/GPS/frontend/app/(app)/profile.tsx) un selector de tema (Claro / Oscuro / Sistema) con controles visuales modernos.
- Actualizar el `StatusBar` en `_layout.tsx` para cambiar dinámicamente entre claro y oscuro.

---

## 4. Landing Page de Descarga de APK
- Crear una Landing Page moderna y responsiva en `backend/public/index.html` (y carpeta `landing/` para distribución estática independiente):
  - **Hero Section**:
    - Título impactante y descripción de valor del sistema de rastreo GPS.
    - Botón de descarga directa del APK (`gps-tracker.apk`) con badges de versión (v1.0.0), tamaño y compatibilidad Android.
    - Código QR interactivo para que los usuarios puedan escanear con la cámara de su teléfono móvil y descargar el APK directamente en su dispositivo.
    - Maqueta de smartphone interactiva con el diseño Blanco & Negro de la app y animación de radar GPS en tiempo real.
  - **Sección de Características**:
    - Telemetría en tiempo real por WebSockets.
    - Historial de recorridos y mapa interactivo.
    - Gestión de dispositivos compartidos y permisos.
    - Interfaz monocromática ultra optimizada para bajo consumo de batería y pantallas OLED.
  - **Guía de Instalación Rápida**:
    - Pasos ilustrados (1. Descargar APK -> 2. Permitir instalación de fuentes desconocidas -> 3. Abrir e iniciar sesión).
  - **Conmutador de Modo Claro / Oscuro**:
    - Toggle interactivo en la landing que replica la estética blanco y negro de la aplicación móvil.
- Configurar [backend/src/app.js](file:///c:/Users/Dev/GPS/backend/src/app.js) para servir los archivos estáticos de la landing page y el endpoint de descarga de archivos APK.

---

## Plan de Verificación

### Pruebas Automatizadas y Validación de Código
- Ejecutar `npm run typecheck` en el frontend para asegurar 0 errores de TypeScript.
- Ejecutar `npm run lint` si está disponible.

### Verificación Visual y Funcional
- Comprobar que los assets PNG generados tengan los tamaños exactos requeridos por Expo.
- Iniciar el servidor backend y verificar que la landing page responda en `http://localhost:4000/` con diseño responsivo, botón de descarga de APK y selector de tema.
- Probar la pantalla de carga (Charging Page) y la transición suave a las pantallas de login/mapa.
- Probar el cambio de tema Claro <-> Oscuro y verificar que todos los textos, inputs, tarjetas y botones mantengan contraste óptimo.
