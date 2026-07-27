// ============================================
// SpeedxSafety - Navigation (Spatial Edition)
// Session-aware routing with auth state persistence
// ============================================

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '../../constants/theme';
import { GlassTabBar } from '../../components/common/SpatialComponents';
import { LinearGradient } from 'expo-linear-gradient';
import { getCurrentUser, onAuthStateChange } from '../../services/authService';

// Auth Screens
import { RoleSelectScreen } from '../../screens/auth/RoleSelectScreen';
import { ParentLoginScreen } from '../../screens/auth/ParentLoginScreen';
import { TeenLoginScreen } from '../../screens/auth/TeenLoginScreen';
import { RegisterScreen } from '../../screens/auth/RegisterScreen';

// Parent Screens
import { ParentDashboard } from '../../screens/parent/ParentDashboard';
import { AlertHistoryScreen } from '../../screens/parent/AlertHistoryScreen';
import { GeofenceScreen } from '../../screens/parent/GeofenceScreen';
import { ReportsScreen } from '../../screens/parent/ReportsScreen';
import { LiveTrackingScreen } from '../../screens/parent/LiveTrackingScreen';

// Teen Screens
import { TeenDashboard } from '../../screens/teen/TeenDashboard';
import { TripHistoryScreen } from '../../screens/teen/TripHistoryScreen';
import { BadgesScreen } from '../../screens/teen/BadgesScreen';

// Admin Screens
import { AdminDashboard } from '../../screens/admin/AdminDashboard';
import { AdminUsersScreen } from '../../screens/admin/AdminUsersScreen';
import { AdminAlertsScreen } from '../../screens/admin/AdminAlertsScreen';

// Shared
import { SettingsScreen } from '../../screens/shared/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ── Spatial screen transition config ─────────
const spatialScreenOptions = {
  headerShown: false,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  cardStyle: { backgroundColor: Colors.bgPrimary },
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
};

function TeenTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => (
        <GlassTabBar
          {...props}
          activeTintColor={Colors.accent}
          inactiveTintColor={Colors.textTertiary}
        />
      )}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => {
          let iconName: any;
          switch (route.name) {
            case 'Drive': iconName = 'speedometer'; break;
            case 'Trips': iconName = 'time'; break;
            case 'Badges': iconName = 'trophy'; break;
            case 'Settings': iconName = 'settings'; break;
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Drive" component={TeenDashboard} />
      <Tab.Screen name="Trips" component={TripHistoryScreen} />
      <Tab.Screen name="Badges" component={BadgesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function ParentTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => (
        <GlassTabBar
          {...props}
          activeTintColor={Colors.primary}
          inactiveTintColor={Colors.textTertiary}
        />
      )}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => {
          let iconName: any;
          switch (route.name) {
            case 'Dashboard': iconName = 'grid'; break;
            case 'Alerts': iconName = 'notifications'; break;
            case 'Geofences': iconName = 'location'; break;
            case 'Reports': iconName = 'stats-chart'; break;
            case 'Settings': iconName = 'settings'; break;
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboard} />
      <Tab.Screen name="Alerts" component={AlertHistoryScreen} />
      <Tab.Screen name="Geofences" component={GeofenceScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => (
        <GlassTabBar
          {...props}
          activeTintColor={Colors.primary}
          inactiveTintColor={Colors.textTertiary}
        />
      )}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => {
          let iconName: any;
          switch (route.name) {
            case 'Overview': iconName = 'grid'; break;
            case 'Users': iconName = 'people'; break;
            case 'AdminAlerts': iconName = 'notifications'; break;
            case 'Settings': iconName = 'settings'; break;
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Overview" component={AdminDashboard} />
      <Tab.Screen name="Users" component={AdminUsersScreen} />
      <Tab.Screen name="AdminAlerts" component={AdminAlertsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

/**
 * Map a user role to the correct initial route name.
 */
const getInitialRouteForRole = (role: string): string => {
  switch (role) {
    case 'parent': return 'ParentTabs';
    case 'admin': return 'AdminTabs';
    case 'teen': return 'TeenTabs';
    default: return 'RoleSelect';
  }
};

export function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string>('RoleSelect');

  useEffect(() => {
    let isMounted = true;

    // Check for existing session on app load
    const checkSession = async () => {
      try {
        const user = await getCurrentUser();
        if (isMounted && user) {
          setInitialRoute(getInitialRouteForRole(user.role));
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data } = onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setInitialRoute('RoleSelect');
      } else if (event === 'SIGNED_IN' && session?.user) {
        try {
          const user = await getCurrentUser();
          if (user && isMounted) {
            setInitialRoute(getInitialRouteForRole(user.role));
          }
        } catch (err) {
          console.warn('Auth state change handler error:', err);
        }
      }
    });

    return () => {
      isMounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  if (isLoading) {
    return (
      <LinearGradient colors={Colors.gradientBg as any} style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={spatialScreenOptions}
    >
      {/* Auth Flow */}
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="ParentLogin" component={ParentLoginScreen} />
      <Stack.Screen name="TeenLogin" component={TeenLoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Main App */}
      <Stack.Screen name="TeenTabs" component={TeenTabs} />
      <Stack.Screen name="ParentTabs" component={ParentTabs} />
      <Stack.Screen name="AdminTabs" component={AdminTabs} />

      {/* Full-screen modals */}
      <Stack.Screen
        name="LiveTracking"
        component={LiveTrackingScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureDirection: 'vertical',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
