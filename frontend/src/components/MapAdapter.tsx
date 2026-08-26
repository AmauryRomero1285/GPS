import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { radius, spacing, typography, useTheme } from '@/theme';

interface MapAdapterProps {
  latitude: number;
  longitude: number;
  markerTitle?: string;
  styleType?: 'dark' | 'streets' | 'satellite' | 'outdoors';
}

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

const MAPBOX_STYLES = {
  dark: 'dark-v11',
  streets: 'streets-v12',
  satellite: 'satellite-streets-v12',
  outdoors: 'outdoors-v12',
};

export function MapAdapter({
  latitude,
  longitude,
  markerTitle,
  styleType,
}: MapAdapterProps) {
  const { colors, isDark } = useTheme();

  const activeStyle = styleType || (isDark ? 'dark' : 'streets');
  const mapboxStyleId = MAPBOX_STYLES[activeStyle] || (isDark ? MAPBOX_STYLES.dark : MAPBOX_STYLES.streets);

  const tileUrlTemplate = MAPBOX_ACCESS_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/${mapboxStyleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`
    : isDark
    ? 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
    : 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        style={styles.map}
        mapType="none"
        region={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <UrlTile
          urlTemplate={tileUrlTemplate}
          maximumZ={19}
          tileSize={256}
          zIndex={-1}
          flipY={false}
        />
        <Marker
          coordinate={{ latitude, longitude }}
          title={markerTitle}
          pinColor={colors.primary}
        />
      </MapView>

      <View style={[styles.attribution, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.85)' }]}>
        <Text style={[typography.caption, styles.attributionText, { color: colors.textMuted }]}>
          {MAPBOX_ACCESS_TOKEN ? '© Mapbox © OpenStreetMap' : '© CartoDB © OpenStreetMap'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  attribution: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  attributionText: {
    fontSize: 9,
  },
});
