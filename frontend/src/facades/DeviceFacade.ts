import { DeviceRepository } from '@/repositories/DeviceRepository';
import { useDeviceStore } from '@/store/deviceStore';
import type { InviteInput, RegisterDeviceInput } from '@/types/device';

// Orquesta DeviceRepository + deviceStore. listShares/invite/revokeShare no
// se guardan en el store global -- solo la lista "mis dispositivos" y
// "compartidos conmigo" se consultan desde varias pantallas a la vez.
export const DeviceFacade = {
  async loadDevices() {
    useDeviceStore.getState().setLoadingDevices(true);
    try {
      const { data } = await DeviceRepository.list();
      useDeviceStore.getState().setDevices(data);
    } finally {
      useDeviceStore.getState().setLoadingDevices(false);
    }
  },

  async loadSharedDevices() {
    useDeviceStore.getState().setLoadingShared(true);
    try {
      const { data } = await DeviceRepository.listSharedWithMe();
      useDeviceStore.getState().setSharedDevices(data);
    } finally {
      useDeviceStore.getState().setLoadingShared(false);
    }
  },

  async registerDevice(input: RegisterDeviceInput) {
    const { data } = await DeviceRepository.register(input);
    useDeviceStore.getState().addDevice(data.device);
    return data;
  },

  async removeDevice(deviceId: string) {
    await DeviceRepository.remove(deviceId);
    useDeviceStore.getState().removeDevice(deviceId);
  },

  async invite(deviceId: string, input: InviteInput) {
    const { data } = await DeviceRepository.invite(deviceId, input);
    return data;
  },

  async acceptInvitation(token: string) {
    const { data } = await DeviceRepository.acceptInvitation(token);
    return data;
  },

  async listShares(deviceId: string) {
    const { data } = await DeviceRepository.listShares(deviceId);
    return data;
  },

  async revokeShare(deviceId: string, shareId: string) {
    await DeviceRepository.revokeShare(deviceId, shareId);
  },
};
