import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AVATARS } from '../constants/avatars';
import { translations } from '../constants/translations';
import { useLang } from '../context/LangContext';
import { COLORS } from '../constants/colors';

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳' },
];

const AVATAR_DESC_KEYS = {
  jule: 'jule_desc',
  leo: 'leo_desc',
  nyx: 'nyx_desc',
  sage: 'sage_desc',
  echo: 'echo_desc',
};

export default function Onboarding() {
  const router = useRouter();
  const { changeLang } = useLang();
  const [step, setStep] = useState(1); // 1: langue, 2: nom+age, 3: avatars
  const [lang, setLang] = useState('fr');
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [names, setNames] = useState(
    Object.fromEntries(AVATARS.map(a => [a.id, a.defaultName]))
  );

  const t = translations[lang];
  const isRTL = lang === 'ar';

  const handleLangSelect = async (code) => {
    setLang(code);
    await changeLang(code);
    setStep(2);
  };

  const handleNameAgeDone = () => {
    if (userName.trim() === '' || userAge.trim() === '') return;
    setStep(3);
  };

  const handleStart = async () => {
    await AsyncStorage.setItem('avatarNames', JSON.stringify(names));
    await AsyncStorage.setItem('onboardingDone', 'true');
    await AsyncStorage.setItem('userName', userName);
    await AsyncStorage.setItem('userAge', userAge);
    router.replace('/home');
  };

  // STEP 1 : Language
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerScreen}>
          <Text style={styles.appName}>هَمْس</Text>
          <View style={styles.langTitles}>
            {LANGUAGES.map(l => (
              <Text key={l.code} style={styles.langHint}>
                {translations[l.code].chooseLanguage}
              </Text>
            ))}
          </View>
          <View style={styles.langList}>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l.code}
                style={styles.langCard}
                onPress={() => handleLangSelect(l.code)}
              >
                <Text style={styles.langFlag}>{l.flag}</Text>
                <Text style={styles.langLabel}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // STEP 2 : Name + Age
  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centerScreen}
        >
          <Text style={styles.appName}>هَمْس</Text>
          <Text style={[styles.welcomeTitle, isRTL && styles.rtl]}>{t.welcomeTitle}</Text>
          <Text style={[styles.welcomeSub, isRTL && styles.rtl]}>{t.welcomeSub}</Text>

          <View style={styles.formBox}>
            <Text style={[styles.formLabel, isRTL && styles.rtl]}>{t.yourName}</Text>
            <TextInput
              style={[styles.formInput, isRTL && styles.rtl]}
              value={userName}
              onChangeText={setUserName}
              placeholder={t.namePlaceholder}
              placeholderTextColor={COLORS.subtext}
              textAlign={isRTL ? 'right' : 'left'}
            />

            <Text style={[styles.formLabel, isRTL && styles.rtl, { marginTop: 16 }]}>
              {t.yourAge}
            </Text>
            <TextInput
              style={[styles.formInput, isRTL && styles.rtl]}
              value={userAge}
              onChangeText={setUserAge}
              placeholder={t.agePlaceholder}
              placeholderTextColor={COLORS.subtext}
              keyboardType="numeric"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (!userName || !userAge) && styles.buttonDisabled]}
            onPress={handleNameAgeDone}
            disabled={!userName || !userAge}
          >
            <Text style={styles.buttonText}>{t.next}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // STEP 3 : Avatars
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>هَمْس</Text>
        <Text style={styles.tagline}>{t.appTagline}</Text>
      </View>

      <View style={styles.instructionBox}>
        <Text style={[styles.instructionTitle, isRTL && styles.rtl]}>
          {t.chooseCompanions}
        </Text>
        <Text style={[styles.instructionSub, isRTL && styles.rtl]}>
          {t.instructionSub}
        </Text>
      </View>

      <FlatList
        data={AVATARS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, isRTL && styles.cardRTL]}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={[styles.defaultName, isRTL && styles.rtl]}>
                {names[item.id]}
              </Text>
              <Text style={[styles.description, isRTL && styles.rtl]}>
                {t[AVATAR_DESC_KEYS[item.id]]}
              </Text>
              <TextInput
                style={[styles.input, isRTL && styles.rtl]}
                value={names[item.id]}
                onChangeText={val => setNames(prev => ({ ...prev, [item.id]: val }))}
                placeholder={`${t.rename}...`}
                placeholderTextColor={COLORS.subtext}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>{t.start}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  appName: {
    fontSize: 48,
    color: COLORS.accent,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  langTitles: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 4,
  },
  langHint: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  langList: {
    width: '100%',
    gap: 12,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    gap: 16,
  },
  langFlag: { fontSize: 32 },
  langLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSub: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  formBox: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.muted,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 16,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.subtext,
    marginTop: 4,
  },
  instructionBox: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  instructionSub: {
    fontSize: 13,
    color: COLORS.subtext,
    lineHeight: 20,
  },
  rtl: { textAlign: 'right' },
  list: { paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  cardRTL: { flexDirection: 'row-reverse' },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  emoji: { fontSize: 28 },
  cardRight: { flex: 1 },
  defaultName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: COLORS.subtext,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.muted,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.muted,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});