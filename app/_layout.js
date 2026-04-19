import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LangProvider, useLang } from '../context/LangContext';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = {
  accent: '#d4a373',
  muted: '#ccd5ae',
  text: '#5c4a2a',
  white: '#ffffff',
  bg: '#fefae0',
};

function TabBarIcon({ name, color, size }) {
  return <Feather name={name} size={size} color={color} />;
}

function InnerLayout() {
  const { t, lang } = useLang();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.muted,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
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