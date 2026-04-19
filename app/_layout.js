import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LangProvider, useLang } from '../context/LangContext';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';


function TabBarIcon({ name, color, size }) {
  return <Feather name={name} size={size} color={color} />;
}

function InnerLayout() {
  const { t, lang } = useLang();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6b7c4b',
        tabBarInactiveTintColor: '#b0a98e',
        tabBarStyle: {
          backgroundColor: '#faf8f2',
          borderTopColor: '#e0d9c8',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          color: COLORS.text,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />

      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: lang === 'ar' ? 'الرئيسية' : lang === 'en' ? 'Home' : 'Accueil',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          tabBarLabel: lang === 'ar' ? 'مذكرتي' : lang === 'en' ? 'Journal' : 'Journal',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="book" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          tabBarLabel: lang === 'ar' ? 'أدوات' : lang === 'en' ? 'Tools' : 'Outils',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="wind" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          tabBarLabel: 'SOS',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="alert-circle" color="red" size={size} />,
          tabBarActiveTintColor: 'red',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: lang === 'ar' ? 'إعدادات' : lang === 'en' ? 'Settings' : 'Réglages',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <LangProvider>
      <InnerLayout />
    </LangProvider>
  );
}