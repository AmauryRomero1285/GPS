import { create } from 'zustand';
import type { Device, SharedDevice } from '@/types/device';

interface DeviceState {
  devices: Device[];
  sharedDevices: SharedDevice[];
  isLoadingDevices: boolean;
  isLoadingShared: boolean;
  setDevices: (devices: Device[]) => void;
  setSharedDevices: (devices: SharedDevice[]) => void;
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  setLoadingDevices: (loading: boolean) => void;
  setLoadingShared: (loading: boolean) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  sharedDevices: [],
  isLoadingDevices: false,
  isLoadingShared: false,
  setDevices: (devices) => set({ devices }),
  setSharedDevices: (sharedDevices) => set({ sharedDevices }),
  addDevice: (device) => set((state) => ({ devices: [device, ...state.devices] })),
  removeDevice: (id) => set((state) => ({ devices: state.devices.filter((d) => d.id !== id) })),
  setLoadingDevices: (isLoadingDevices) => set({ isLoadingDevices }),
  setLoadingShared: (isLoadingShared) => set({ isLoadingShared }),
}));
