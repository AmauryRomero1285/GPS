import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface MapAdapterProps {
  latitude: number;
  longitude: number;
  markerTitle?: string;
}

// Adapter/Bridge (ver frontend/docs/README.md "Patrón Adaptador"): encapsula
// react-native-maps detrás de una interfaz de props simple (latitude/longitude),
// para poder cambiar de proveedor de mapas sin tocar las pantallas que lo usan.
export function MapAdapter({ latitude, longitude, markerTitle }: MapAdapterProps) {
  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      region={{ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
    >
      <Marker coordinate={{ latitude, longitude }} title={markerTitle} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
