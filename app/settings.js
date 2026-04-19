import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Alert, Animated
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../context/LangContext';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  bg: '#fdfbf4', card: '#ffffff', accent: '#7cb87a',
  accentDark: '#5a9658', soft: '#f0ece0', text: '#3d3828',
  subtext: '#7a7455', muted: '#b8b49a', white: '#ffffff',
  border: '#e2dcc8', danger: '#c0695a',
};

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳' },
];

export default function Settings() {
  const router = useRouter();
  const { t, lang, isRTL, changeLang } = useLang();
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [saved, setSaved] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      const name = await AsyncStorage.getItem('userName');
      const age = await AsyncStorage.getItem('userAge');
      if (name) setUserName(name);
      if (age) setUserAge(age);
    };
    load();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleSave = async () => {
    if (!userName.trim()) return;
    await AsyncStorage.setItem('userName', userName.trim());
    await AsyncStorage.setItem('userAge', userAge.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      lang === 'ar' ? 'إعادة الإعداد' : lang === 'en' ? 'Reset Setup' : 'Réinitialiser',
      lang === 'ar' ? 'ستعود إلى شاشة الترحيب. هل أنت متأكد؟'
        : lang === 'en' ? 'You\'ll go back to the welcome screen. Are you sure?'
        : 'Tu retourneras à l\'écran de bienvenue. Tu es sûr·e ?',
      [
        { text: lang === 'ar' ? 'إلغاء' : lang === 'en' ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: lang === 'ar' ? 'نعم' : lang === 'en' ? 'Yes' : 'Oui',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('onboardingDone');
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleClearAllChats = () => {
    Alert.alert(
      lang === 'ar' ? 'مسح كل المحادثات' : lang === 'en' ? 'Clear all chats' : 'Effacer toutes les conversations',
      lang === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه.'
        : lang === 'en' ? 'This action cannot be undone.'
        : 'Cette action est irréversible.',
      [
        { text: lang === 'ar' ? 'إلغاء' : lang === 'en' ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: lang === 'ar' ? 'مسح' : lang === 'en' ? 'Clear' : 'Effacer',
          style: 'destructive',
          onPress: async () => {
            const keys = ['chat_history_jule', 'chat_history_leo', 'chat_history_nyx', 'chat_history_sage', 'chat_history_echo'];
            await Promise.all(keys.map(k => AsyncStorage.removeItem(k)));
            Alert.alert('✅', lang === 'ar' ? 'تم المسح' : lang === 'en' ? 'Cleared!' : 'Effacé !');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="settings" size={20} color={COLORS.accent} />
        </View>
        <Text style={styles.headerTitle}>
          {lang === 'ar' ? 'الإعدادات' : lang === 'en' ? 'Settings' : 'Paramètres'}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── PROFILE ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
            {lang === 'ar' ? '👤 ملفي الشخصي' : lang === 'en' ? '👤 My Profile' : '👤 Mon profil'}
          </Text>
          <View style={styles.card}>
            <Text style={[styles.label, isRTL && styles.rtl]}>
              {lang === 'ar' ? 'الاسم' : lang === 'en' ? 'Name' : 'Prénom'}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.rtl]}
              value={userName}
              onChangeText={setUserName}
              placeholder={lang === 'ar' ? 'اسمك...' : lang === 'en' ? 'Your name...' : 'Ton prénom...'}
              placeholderTextColor={COLORS.muted}
              textAlign={isRTL ? 'right' : 'left'}
            />
            <Text style={[styles.label, isRTL && styles.rtl, { marginTop: 14 }]}>
              {lang === 'ar' ? 'العمر' : lang === 'en' ? 'Age' : 'Âge'}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.rtl]}
              value={userAge}
              onChangeText={setUserAge}
              placeholder={lang === 'ar' ? 'عمرك...' : lang === 'en' ? 'Your age...' : 'Ton âge...'}
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              textAlign={isRTL ? 'right' : 'left'}
            />
            <TouchableOpacity
              style={[styles.saveBtn, saved && styles.saveBtnDone]}
              onPress={handleSave}
            >
              <Feather name={saved ? 'check' : 'save'} size={16} color={COLORS.white} />
              <Text style={styles.saveBtnText}>
                {saved
                  ? (lang === 'ar' ? 'تم الحفظ ✓' : lang === 'en' ? 'Saved ✓' : 'Sauvegardé ✓')
                  : (lang === 'ar' ? 'حفظ' : lang === 'en' ? 'Save' : 'Sauvegarder')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LANGUE ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
            {lang === 'ar' ? '🌍 اللغة' : lang === 'en' ? '🌍 Language' : '🌍 Langue'}
          </Text>
          <View style={styles.card}>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l.code}
                style={[styles.langRow, lang === l.code && styles.langRowActive]}
                onPress={() => changeLang(l.code)}
              >
                <Text style={styles.langFlag}>{l.flag}</Text>
                <Text style={[styles.langLabel, lang === l.code && { color: COLORS.accent, fontWeight: '700' }]}>
                  {l.label}
                </Text>
                {lang === l.code && (
                  <Feather name="check-circle" size={18} color={COLORS.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── AVATARS ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
            {lang === 'ar' ? '🤖 الشخصيات' : lang === 'en' ? '🤖 Avatars' : '🤖 Avatars'}
          </Text>
          <TouchableOpacity
            style={[styles.card, styles.actionRow]}
            onPress={() => router.push('/onboarding')}
          >
            <Feather name="edit-3" size={18} color={COLORS.accent} />
            <Text style={[styles.actionText, isRTL && styles.rtl]}>
              {lang === 'ar' ? 'إعادة تسمية الشخصيات' : lang === 'en' ? 'Rename avatars' : 'Renommer les avatars'}
            </Text>
            <Feather name="chevron-right" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        {/* ── DONNÉES ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
            {lang === 'ar' ? '🗂️ البيانات' : lang === 'en' ? '🗂️ Data' : '🗂️ Données'}
          </Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerRow} onPress={handleClearAllChats}>
              <Feather name="trash-2" size={18} color={COLORS.danger} />
              <Text style={[styles.dangerText, isRTL && styles.rtl]}>
                {lang === 'ar' ? 'مسح كل المحادثات' : lang === 'en' ? 'Clear all conversations' : 'Effacer toutes les conversations'}
              </Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.dangerRow} onPress={handleResetOnboarding}>
              <Feather name="refresh-ccw" size={18} color={COLORS.danger} />
              <Text style={[styles.dangerText, isRTL && styles.rtl]}>
                {lang === 'ar' ? 'إعادة الإعداد الأولي' : lang === 'en' ? 'Reset onboarding' : 'Réinitialiser l\'onboarding'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── À PROPOS ── */}
        <View style={styles.section}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>هَمْس</Text>
            <Text style={styles.aboutSub}>
              {lang === 'ar' ? 'مساحتك للتنفس والشعور والنمو'
                : lang === 'en' ? 'Your space to breathe, feel and grow'
                : 'Ton espace pour souffler, ressentir et grandir'}
            </Text>
            <Text style={styles.aboutVersion}>v1.0.0 — ARSII Hackathon 2025</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: COLORS.soft,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  scroll: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.subtext, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.soft,
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 11, fontSize: 15,
    color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 14, paddingVertical: 12,
    marginTop: 16,
  },
  saveBtnDone: { backgroundColor: COLORS.accentDark },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  langRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 12,
    borderRadius: 12, paddingHorizontal: 8,
  },
  langRowActive: { backgroundColor: COLORS.soft },
  langFlag: { fontSize: 24 },
  langLabel: { fontSize: 15, color: COLORS.text, flex: 1 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  actionText: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '600' },
  dangerRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 12,
  },
  dangerText: { fontSize: 14, color: COLORS.danger, flex: 1, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  aboutCard: {
    backgroundColor: '#3d3828',
    borderRadius: 20, padding: 24, alignItems: 'center',
  },
  aboutTitle: { fontSize: 36, color: '#d4a373', fontWeight: 'bold', marginBottom: 6 },
  aboutSub: { fontSize: 13, color: '#b8b49a', textAlign: 'center', marginBottom: 8 },
  aboutVersion: { fontSize: 11, color: '#7a7455' },
  rtl: { textAlign: 'right' },
});