// Contrato que debe cumplir cualquier implementación de repositorio de telemetría,
// independientemente del motor de persistencia usado (actualmente MongoDB).
//
// create({ deviceId, latitude, longitude, altitude, speed, satellites, recordedAt }) -> Promise<TelemetryPoint>
// findLatestByDevice(deviceId) -> Promise<TelemetryPoint|null>
// findHistoryByDevice(deviceId, { from, to, limit }) -> Promise<TelemetryPoint[]>
