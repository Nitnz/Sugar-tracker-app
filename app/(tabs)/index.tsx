import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import AddEntryScreen from '../screens/AddEntryScreen';
import TipsScreen from '../screens/MotivationScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const scheme = useColorScheme();

  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#6C47FF',
            height: 70,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            position: 'absolute',
            overflow: 'hidden',
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#ddd',
          tabBarIcon: ({ color }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Tips') {
              iconName = 'bulb';
            } else if (route.name === 'History') {
              iconName = 'list';
            } else if (route.name === 'Stats') {
              iconName = 'stats-chart';
            } else if (route.name === 'Add Entry') {
              iconName = 'add-circle';
            }
            return <Ionicons name={iconName as any} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Tips" component={TipsScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Add Entry" component={AddEntryScreen} />
      </Tab.Navigator>
  );
}
