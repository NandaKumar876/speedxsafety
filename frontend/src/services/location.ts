// SpeedxSafety - Location Tracking Service
import * as Location from 'expo-location';
import { LocationPoint } from '../types';

let watchId: Location.LocationSubscription | null = null;
let lastPosition: LocationPoint | null = null;

export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const startTracking = (
  onUpdate: (point: LocationPoint) => void,
  intervalMs: number = 2000
): void => {
  Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: intervalMs,
      distanceInterval: 5,
    },
    (location) => {
      const point: LocationPoint = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        speed: Math.max(0, (location.coords.speed || 0) * 3.6), // m/s to km/h
        timestamp: location.timestamp,
      };
      onUpdate(point);
      lastPosition = point;
    }
  ).then(sub => { watchId = sub; });
};

export const stopTracking = (): void => {
  if (watchId) {
    watchId.remove();
    watchId = null;
  }
};

export const calculateSpeed = (p1: LocationPoint, p2: LocationPoint): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const dist = R * c; // meters
  const time = (p2.timestamp - p1.timestamp) / 1000; // seconds
  return time > 0 ? (dist / time) * 3.6 : 0; // km/h
};

export const getCurrentPosition = async (): Promise<LocationPoint | null> => {
  try {
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return {
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      speed: Math.max(0, (loc.coords.speed || 0) * 3.6),
      timestamp: loc.timestamp,
    };
  } catch { return null; }
};
