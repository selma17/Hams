import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const done = await AsyncStorage.getItem('onboardingDone');
      if (done === 'true') {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    };
    check();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F1A', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#C77DFF" size="large" />
    </View>
  );
}