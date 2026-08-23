# GPS - Backend Architecture

Este sistema es encargado de recibir cooredenadas GPS mediante peticiones HTTP desde un nodo receptor LoRa (ESP32), procesarlas, almacenarlas y esponerlas en tiempo real a una interfaz web a través de WebSockets, manteniendo además un panel de documentación técnica (Swagger). Mezclar todas estas responsabilidades en un único archivo (server.js) genera alto acoplamiento y dificulta el mantenimiento o la adición de nuevas funciones.

Se eligió la **Arquitectura en Capas** para separar de manera escrita el protocolo de transporte, la lógica de negocio y el acceso a los datos.

```
[ Cliente HTTP / ESP32 ]
           │
           ▼
┌──────────────────────────────────────┐
│  Capa de Controladores (Controllers) │ ──> Maneja HTTP, DTOs y respuestas
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Capa de Servicios (Services)        │ ──> Reglas de negocio y coordinación
└──────────────────────────────────────┘
           │
           ├──────────────────────────┐
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│ Repositorio Telemetría│   │ Repositorio Usuario  │ ──> Persistencia
│      (MongoDB)       │   │        (SQL)         │
└──────────────────────┘   └──────────────────────┘

```

- **Separación de Responsabilidades (Separation of Concerns)**
    - *Controllers:* Se encarga únicamente de la comunicación HTTP/REST (validación de formatos de entrada, headers y códigod de respuesta 200, 400, 500).
    - *Services:* Contienen la lógica pura dels dominio (filtrado de lecturas GPS nulas, orquestación de notificaciones).
     - *Repositories:* Aislan la interacción directa con las bases de datos.
 - **Testeabilidad y Mantenibilidad:** Es posible probar lalógica de negocio (Servicio) creando mocks o simulaciones del Repositorio sin necesidad de conectarse a una base de adatos real.

 ## Polyglot Persistence

 El sistema gestiona dos tipos de información radicalmente opuesos:

 - Flujo de telemetría constante: Coordenadas GPS enviadas frecuentemente (alto volumen de escrituras, escritura flexible).

 - Datos de usuarios y dominio: Cuentas, roles, logins y permisos (requiere transacciones ACID e integridad referencial).

 Se optó por no forzar una sola base de datos paara todo el sistema, implementando **Persistencia Políglota**

 |Database|Type| System role| Technique Justify|
 |--------|----|------------|------------------|
 |MongoDB|NoSQL (Orientada a Documentos)| Telemetría / Historial GPS| - **Alta cocnurrencia de escritura:** Optimizado para la ingesta continua de series temporales
 - **Consultas Geoespaciales:** Soporta indices *2dsphere* y operadores *$near* o *$geoWithin* para geocercas en el mapa.|
 |PostgreSQL/SQLite|Relacional (SQL)|Usuarios y Dispositivos| - **Garantías ACID:** Asegura que los datos de autenticación y asignación de nodos/dispositivos mantengan integridad estricta mediente *Foreign Keys*|

 ## Patrones de Comportamiento y Estructurales Internos

 - **Observer/Publicador-Suscriptor (WebSockets)**
    - *Problema:* La interfaz web necesita reflejar el movimiento del Rastreador GPS de forma inmediata sin que el usuario esté recargando la página ni saturar el servidor con peticiones HTTP repetitivas (polling).
    - *Solución:* Se impementó unmódulo WebSocket que actúa como Publicador. Cada vez que el endpoint HTTP recibe una nueva coordenada del ESP32, la capa de Servicio notifica inmediatamente a todos los clientes web (suscriptores) conectados.

- **Repository Pattern**
    - *Problema:* Aceptar lalógica de consultas a la base de datos dentro de las rutas o controladores impide cambiar de tecnología de almacenamiento fácilmente.
    - *Solución:* Encapsular todas las consultas a la base de datos detrás de una interfaz clara (*guardarUbicacion()* *obtenerUltimaUbicacion()*).Esto permitió migrar el almacenamiento de un objeto en memoria a SQLite o MongoDB modificando únicamente un archivo, sin alterar los controladores ni el WebSocket.