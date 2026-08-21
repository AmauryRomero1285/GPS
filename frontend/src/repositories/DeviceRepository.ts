import { apiRequest } from '@/api/client';
import type { ApiMessage, ApiSuccess } from '@/types/api';
import type {
  AcceptedShare,
  Device,
  DeviceShare,
  InviteInput,
  RegisterDeviceInput,
  RegisterDeviceResult,
  SharedDevice,
  ShareInvitation,
} from '@/types/device';

// Un método por endpoint del backend (backend/src/routes/device.routes.js),
// sin lógica de negocio -- eso vive en DeviceFacade.
export const DeviceRepository = {
  register(input: RegisterDeviceInput) {
    return apiRequest<ApiSuccess<RegisterDeviceResult>>('/devices', {
      method: 'POST',
      body: input,
    });
  },

  list() {
    return apiRequest<ApiSuccess<Device[]>>('/devices', { method: 'GET' });
  },

  remove(deviceId: string) {
    return apiRequest<ApiMessage>(`/devices/${deviceId}`, { method: 'DELETE' });
  },

  listSharedWithMe() {
    return apiRequest<ApiSuccess<SharedDevice[]>>('/devices/shared-with-me', { method: 'GET' });
  },

  invite(deviceId: string, input: InviteInput) {
    return apiRequest<ApiSuccess<ShareInvitation>>(`/devices/${deviceId}/shares`, {
      method: 'POST',
      body: input,
    });
  },

  acceptInvitation(token: string) {
    return apiRequest<ApiSuccess<AcceptedShare>>(`/devices/shares/${token}/accept`, {
      method: 'POST',
    });
  },

  listShares(deviceId: string) {
    return apiRequest<ApiSuccess<DeviceShare[]>>(`/devices/${deviceId}/shares`, { method: 'GET' });
  },

  revokeShare(deviceId: string, shareId: string) {
    return apiRequest<ApiMessage>(`/devices/${deviceId}/shares/${shareId}`, { method: 'DELETE' });
  },
};
