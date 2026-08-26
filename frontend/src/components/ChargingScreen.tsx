import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { radius, spacing, useTheme } from "@/theme";

interface ChargingScreenProps {
  onFinish?: () => void;
  message?: string;
}

export function ChargingScreen({ onFinish, message }: ChargingScreenProps) {
  const { colors, isDark } = useTheme();

  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [statusText, setStatusText] = useState("Iniciando GPS Tracker...");

  useEffect(() => {
    // Pulse animation loop
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const pulse1 = createPulse(pulseAnim1, 0);
    const pulse2 = createPulse(pulseAnim2, 700);
    const pulse3 = createPulse(pulseAnim3, 1400);

    pulse1.start();
    pulse2.start();
    pulse3.start();

    // Breathing logo animation
    const breathAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.95,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    breathAnim.start();

    // Smooth simulated progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      if (onFinish) {
        setTimeout(onFinish, 200);
      }
    });

    const timer1 = setTimeout(
      () => setStatusText("Verificando sesión segura..."),
      450,
    );
    const timer2 = setTimeout(
      () => setStatusText("Sincronizando telemetría..."),
      950,
    );
    const timer3 = setTimeout(() => setStatusText("Sistema listo."), 1450);

    return () => {
      pulse1.stop();
      pulse2.stop();
      pulse3.stop();
      breathAnim.stop();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish, pulseAnim1, pulseAnim2, pulseAnim3, logoScale, progressAnim]);

  const renderRadarRing = (anim: Animated.Value) => {
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.4],
    });
    const opacity = anim.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.6, 0.3, 0],
    });

    return (
      <Animated.View
        style={[
          styles.radarRing,
          {
            borderColor: colors.text,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Radar pulses behind logo */}
      <View style={styles.centerStage}>
        {renderRadarRing(pulseAnim1)}
        {renderRadarRing(pulseAnim2)}
        {renderRadarRing(pulseAnim3)}

        <Animated.View
          style={[
            styles.logoContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={
              isDark
                ? require("../../assets/splash-icon.png")
                : require("../../assets/icon.png")
            }
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Brand Title & Subtitle */}
      <View style={styles.brandContainer}>
        <Text style={[styles.brandTitle, { color: colors.text }]}>locfar</Text>
        <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>
          LOCALIZACIÓN Y TELEMETRÍA EN TIEMPO REAL
        </Text>
      </View>

      {/* Progress & Status */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBarTrack,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: colors.primary,
                width: progressWidth,
              },
            ]}
          />
        </View>
        <Text style={[styles.statusText, { color: colors.textMuted }]}>
          {message || statusText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  centerStage: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: spacing.xl,
  },
  radarRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl || 48,
    gap: spacing.xs,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 3,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  progressContainer: {
    width: "75%",
    maxWidth: 280,
    alignItems: "center",
    gap: spacing.sm,
  },
  progressBarTrack: {
    width: "100%",
    height: 4,
    borderRadius: radius.full,
    overflow: "hidden",
    borderWidth: 0.5,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
