// SpeedxSafety - App Entry Point (Spatial Edition)
import React, { useEffect, useRef } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { AppNavigator } from './src/app/navigation/AppNavigator';
import { Colors } from './src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const fadeIn = useRef(new Animated.Value(0)).current;
  const loadingFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fontsLoaded) {
      // Smooth transition from loading to app
      Animated.sequence([
        Animated.timing(loadingFade, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <LinearGradient colors={Colors.gradientBg as any} style={styles.loading}>
        <Animated.View style={[styles.loadingContent, { opacity: loadingFade }]}>
          <View style={styles.loadingGlow} />
          <ActivityIndicator size="large" color={Colors.primary} />
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn }]}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <AppNavigator />
      </NavigationContainer>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.ambientPrimary,
  },
});
