// Envolturas de respuesta que ya usa el backend (ver backend/src/controllers/*).
export interface ApiSuccess<T> {
  status: 'success';
  message?: string;
  data: T;
}

export interface ApiErrorBody {
  status: 'error';
  message: string;
}
