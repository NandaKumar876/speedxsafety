// ============================================
// SpeedxSafety - Realtime Service (Supabase)
// ============================================

import { supabase } from './supabase';
import { TeenLocation, Alert } from '../types';

/**
 * Subscribe to real-time teen location updates.
 * Used in LiveTrackingScreen to animate the vehicle marker.
 */
export const subscribeToTeenLocation = (
  teenId: string,
  onUpdate: (location: TeenLocation) => void
) => {
  const channel = supabase
    .channel(`teen-location-${teenId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'teen_locations',
        filter: `teen_id=eq.${teenId}`,
      },
      (payload) => {
        onUpdate(payload.new as TeenLocation);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to real-time teen status updates (is_driving, speed, etc.)
 */
export const subscribeToTeenStatus = (
  parentId: string,
  onUpdate: (teen: any) => void
) => {
  const channel = supabase
    .channel(`teen-status-${parentId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'teens',
        filter: `parent_uid=eq.${parentId}`,
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to new alerts for a parent.
 * Used for in-app push notification display.
 */
export const subscribeToAlerts = (
  onNewAlert: (alert: Alert) => void
) => {
  const channel = supabase
    .channel('new-alerts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
      },
      (payload) => {
        onNewAlert(payload.new as Alert);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to trip status changes (start/end).
 */
export const subscribeToTripChanges = (
  teenId: string,
  onChange: (trip: any) => void
) => {
  const channel = supabase
    .channel(`trip-changes-${teenId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trips',
        filter: `teen_id=eq.${teenId}`,
      },
      (payload) => {
        onChange(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
