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

- **Patrón Custom Hook (Abstracci´on de Lógica de Red)**
    - Esparcir los Listeners de Websockets o las llamadas HTTP *fetch* dentro del ciclo de vida de los componentes (*useEffect*) genera código duplicando y fugas de memoria si la pantalla se desmonta.
    - Encapsular toda la integración del webSocket en un Custom Hook. Este hook gestiona automáticamente la apertura, cierre y reconexión del socket en segundo plano, devolviendo únicamente a la interfaz.