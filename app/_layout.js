import { Stack } from 'expo-router';
import { LangProvider } from '../context/LangContext';

export default function RootLayout() {
  return (
    <LangProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="home" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="journal" />
        <Stack.Screen name="tools" />
      </Stack>
    </LangProvider>
  );
}