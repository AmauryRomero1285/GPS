import { DeviceFacade } from '@/facades/DeviceFacade';
import { useDeviceStore } from '@/store/deviceStore';

export function useDevices() {
  const devices = useDeviceStore((state) => state.devices);
  const sharedDevices = useDeviceStore((state) => state.sharedDevices);
  const isLoadingDevices = useDeviceStore((state) => state.isLoadingDevices);
  const isLoadingShared = useDeviceStore((state) => state.isLoadingShared);

  return {
    devices,
    sharedDevices,
    isLoadingDevices,
    isLoadingShared,
    loadDevices: DeviceFacade.loadDevices,
    loadSharedDevices: DeviceFacade.loadSharedDevices,
    registerDevice: DeviceFacade.registerDevice,
    removeDevice: DeviceFacade.removeDevice,
    invite: DeviceFacade.invite,
    acceptInvitation: DeviceFacade.acceptInvitation,
    listShares: DeviceFacade.listShares,
    revokeShare: DeviceFacade.revokeShare,
  };
}
