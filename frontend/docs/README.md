# GPS - Frontend Architecture

## Patrón Arquitectonico General: Componentes Presentacionales y de Contenedor (Container/Presentational Pattern)

En aplicaciones de telemetría y rastreo GPS multiplataforma (iOS, Android y Web), mezclar la lógica de red (WebSockets/HTTP), la gestión del estado global de las coordenadas y la biblioteca de renderizado del mapa genera código spaguetti. Además, complica el mantenimiento cuando se requiere adaptar componentes visuales a distintas pantallas o plataformas.

Se adoptó el patrón de *Container/Presentational Components*, respaldado por el ecosistema de Custom Hooks de React Native.

- **Capa de Contenedor/Custom Hooks (*useGpsSocket/GPSContainer*):** Encargado exclusivo de conectarse al servidor WebSocket *(ws://)*, administrar la reconexión automática en caso de pérdida de cobertura móvil y almacenar la latitud/loguitud en el estado local o global.
- **Capa Presentacional (*MapViewComponent*):** Componente puro de React Native que recibe *latitude*, *loguitud* y el historial de coordenadas como props. Se encarga únicamente del renderizado en pantalla. No contiene lógica de red.

## Patrón de Estado: Flujo Unidireccional de Datos (Undirectional Data Flow/Flux)

En un sistema GPS, las coordenadas cambian de forma asincrona e impredecible. Múltiples pantallas o componentes de la app necesitan reaccionar a la nueva ubicación simultáneamente (el marcador en el mapa, el panel de velocidad, el historial de ruta y el indicador de señal del dispositivo).

Se implementa un *Flujo Unidirecciional de Datos* mediante gestión de estado centralizada (via Zustand, Redux Toolkit o React Context API):

```
[ Evento WebSocket: Nueva Coordenada ]
                                    │
                                    ▼
                      ┌──────────────────────────┐
                      │    Store / Estado Global │
                      └─────────────┬────────────┘
                                    │ (Emite re-renderizado)
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
   │ React Native Map│     │ Telemetry Table │     │ Connection LED  │
   │ `<Marker />`    │     │ `<Text>`        │     │ `<View>`        │
   └─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Predicibilidad y Reactividad:** La capa de red envía la coordenada al Store. Este actualiza el estado global y React Native re-renderiza eficientemente solo con los componentes suscritos. Si mañana agregamos una pantalla de alertas de geocerca en el móvil, consumirá el mismo estado sin midificar el módulo de red.

## Patrones Estructurales y de Creación Internos

- **Patrón Adaptador/Estrategia (Adapter Pattern para Multiplataforma)**
    - Las bibliotecas de mapas en nativo (Google Maps/Apple Maps via *react-native-maps*).
    - Se eimplementa un *Adapter/Bridge Component*. Este componente encapsula la API específica de la plataforma, ofreciendo una interfaz de props unificada para el resto de la aplicación.

- **Patrón Custom Hook (Abstraccion de Lógica de Red)**
    - Esparcir los Listeners de Websockets o las llamadas HTTP *fetch* dentro del ciclo de vida de los componentes (*useEffect*) genera código duplicando y fugas de memoria si la pantalla se desmonta.
    - Encapsular toda la integración del webSocket en un Custom Hook. Este hook gestiona automáticamente la apertura, cierre y reconexión del socket en segundo plano, devolviendo únicamente a la interfaz.

## Capas (de la pantalla al backend)

```
screens (app/, Expo Router = containers)
        │
components (src/components/, presentacionales, solo props)
        │
hooks (src/hooks/: useAuth, useDevices, useGpsSocket)
        │
facades (src/facades/: AuthFacade, DeviceFacade, TelemetryFacade)
        │  — orquestan repos + SecureStore + store en un método simple
repositories (src/repositories/: AuthRepository, DeviceRepository, TelemetryRepository)
        │  — un método por endpoint del backend, sin lógica de negocio
src/api/client.ts (fetch wrapper: base URL, header Bearer, 401 → refresh y reintenta una vez)
        │
backend REST / WebSocket
```

Esto refleja del lado del cliente la misma separación por capas que ya usa el backend
(`repositories/sql/*.js` → `services/*.js` → `controllers/*.js`).

## Configuración (variables de entorno)

Expo expone al bundle solo las variables prefijadas `EXPO_PUBLIC_*` (se inlinean en build time).
Crea un `.env` local (no versionado) en `frontend/`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.50:4000/api
```

`localhost` no resuelve al backend desde un dispositivo físico ni desde la mayoría de emuladores:
usa la IP de LAN de tu máquina, o `http://10.0.2.2:4000/api` específicamente en el emulador de Android.

Para el mapa (`react-native-maps` en Android usa Google Maps), agrega tu API key en
`app.json` → `expo.android.config.googleMaps.apiKey`.

## Generar el .apk

```
pnpm add -g eas-cli   # una vez
eas login
eas build --platform android --profile preview   # perfil "preview" en eas.json ya está configurado como buildType "apk"
```

El perfil `preview` (ver `eas.json`) genera un `.apk` instalable directamente (distribución interna),
a diferencia de `production`, que genera un `.aab` para subir a Play Store.