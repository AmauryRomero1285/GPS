// Envolturas de respuesta que ya usa el backend (ver backend/src/controllers/*).
export interface ApiSuccess<T> {
  status: 'success';
  message?: string;
  data: T;
}

// Algunos endpoints (p.ej. DELETE) responden sin campo "data" en absoluto.
export interface ApiMessage {
  status: 'success';
  message: string;
}

export interface ApiErrorBody {
  status: 'error';
  message: string;
}
