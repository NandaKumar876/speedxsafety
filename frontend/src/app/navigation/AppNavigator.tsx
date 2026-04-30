// SpeedxSafety - Navigation Setup
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight } from '../../constants/theme';

// Screens
import { LoginScreen } from '../../screens/auth/LoginScreen';
import { RegisterScreen } from '../../screens/auth/RegisterScreen';
import { TeenDashboard } from '../../screens/teen/TeenDashboard';
import { TripHistoryScreen } from '../../screens/teen/TripHistoryScreen';
import { BadgesScreen } from '../../screens/teen/BadgesScreen';
import { ParentDashboard } from '../../screens/parent/ParentDashboard';
import { AlertHistoryScreen } from '../../screens/parent/AlertHistoryScreen';
import { GeofenceScreen } from '../../screens/parent/GeofenceScreen';
import { ReportsScreen } from '../../screens/parent/ReportsScreen';
import { SettingsScreen } from '../../screens/shared/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabBarStyle = {
  backgroundColor: '#0D1130',
  borderTopColor: 'rgba(255,255,255,0.06)',
  borderTopWidth: 1,
  height: 85,
  paddingTop: 8,
  paddingBottom: 28,
};

function TeenTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as any },
        tabBarIcon: ({ color, size }) => {
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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as any },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          switch (route.name) {
            case 'Dashboard': iconName = 'grid'; break;
            case 'Alerts': iconName = 'notifications'; break;
            case 'Geofences': iconName = 'location'; break;
            case 'Reports': iconName = 'bar-chart'; break;
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

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="TeenTabs" component={TeenTabs} />
      <Stack.Screen name="ParentTabs" component={ParentTabs} />
    </Stack.Navigator>
  );
}
