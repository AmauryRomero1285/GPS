// Formas que ya retorna el backend (ver backend/src/repositories/sql/device*.js).
export type PermissionLevel = 'READ_ONLY' | 'FULL_ACCESS';

export interface Device {
  id: string; // MAC / id único del ESP32, no un UUID generado
  owner_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface RegisterDeviceInput {
  id: string;
  name: string;
}

export interface RegisterDeviceResult {
  device: Device;
  // Solo se retorna una vez, al registrar el dispositivo.
  deviceToken: string;
}

// Fila de device_shares con el usuario invitado ya unido (JOIN con users).
export interface DeviceShare {
  id: string;
  device_id: string;
  permission_level: PermissionLevel;
  created_at: string;
  user_id: string;
  email: string;
  username: string;
  name: string;
  lastname: string;
}

// Dispositivo compartido conmigo (JOIN con devices desde mi propio device_shares).
export interface SharedDevice {
  share_id: string;
  permission_level: PermissionLevel;
  shared_at: string;
  id: string;
  owner_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface ShareInvitation {
  id: string;
  device_id: string;
  invited_by_user_id: string;
  invited_email: string;
  permission_level: PermissionLevel;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface InviteInput {
  email: string;
  permissionLevel: PermissionLevel;
}

export interface AcceptedShare {
  id: string;
  device_id: string;
  shared_with_user_id: string;
  permission_level: PermissionLevel;
  created_at: string;
}
