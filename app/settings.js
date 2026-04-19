import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Alert, Animated
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../context/LangContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const LANGUAGES = [
  { code: 'fr', label: 'Français', sublabel: 'French', icon: 'translate' },
  { code: 'en', label: 'English', sublabel: 'Anglais', icon: 'translate' },
  { code: 'ar', label: 'العربية', sublabel: 'Arabe', icon: 'translate' },
];

function SettingRow({ icon, iconColor, iconBg, title, subtitle, onPress, rightElement, danger }) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, danger && styles.settingRowDanger]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIconWrap, { backgroundColor: iconBg || COLORS.soft }]}>
        <Feather name={icon} size={18} color={iconColor || COLORS.accent} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, danger && { color: '#c0695a' }]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || <Feather name="chevron-right" size={16} color={COLORS.muted} />}
    </TouchableOpacity>
  );
}

export default function Settings() {
  const router = useRouter();
  const { t, lang, isRTL, changeLang } = useLang();
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [saved, setSaved] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
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
    setEditingProfile(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      lang === 'ar' ? 'إعادة الإعداد' : lang === 'en' ? 'Reset Setup' : 'Réinitialiser',
      lang === 'ar' ? 'ستعود إلى شاشة الترحيب.'
        : lang === 'en' ? 'You\'ll go back to the welcome screen.'
        : 'Tu retourneras à l\'écran de bienvenue.',
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
      lang === 'ar' ? 'مسح المحادثات' : lang === 'en' ? 'Clear chats' : 'Effacer les conversations',
      lang === 'ar' ? 'لا يمكن التراجع عن هذا.'
        : lang === 'en' ? 'This cannot be undone.'
        : 'Cette action est irréversible.',
      [
        { text: lang === 'ar' ? 'إلغاء' : lang === 'en' ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: lang === 'ar' ? 'مسح' : lang === 'en' ? 'Clear' : 'Effacer',
          style: 'destructive',
          onPress: async () => {
            const keys = ['chat_history_jule', 'chat_history_leo', 'chat_history_nyx', 'chat_history_sage', 'chat_history_echo'];
            await Promise.all(keys.map(k => AsyncStorage.removeItem(k)));
            Alert.alert('', lang === 'ar' ? 'تم المسح' : lang === 'en' ? 'Done!' : 'Effacé !');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Feather name="settings" size={18} color={COLORS.accent} />
        </View>
        <Text style={styles.headerTitle}>
          {lang === 'ar' ? 'الإعدادات' : lang === 'en' ? 'Settings' : 'Paramètres'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── PROFILE CARD ── */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Feather name="user" size={32} color={COLORS.accent} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName || '—'}</Text>
            <Text style={styles.profileAge}>
              {userAge ? `${userAge} ${lang === 'ar' ? 'سنة' : lang === 'en' ? 'years old' : 'ans'}` : '—'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditingProfile(!editingProfile)}
          >
            <Feather name={editingProfile ? 'x' : 'edit-2'} size={16} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Edit form */}
        {editingProfile && (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Feather name="user" size={16} color={COLORS.subtext} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isRTL && styles.rtl]}
                value={userName}
                onChangeText={setUserName}
                placeholder={lang === 'ar' ? 'اسمك...' : lang === 'en' ? 'Your name...' : 'Ton prénom...'}
                placeholderTextColor={COLORS.muted}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
            <View style={styles.inputGroup}>
              <Feather name="calendar" size={16} color={COLORS.subtext} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isRTL && styles.rtl]}
                value={userAge}
                onChangeText={setUserAge}
                placeholder={lang === 'ar' ? 'عمرك...' : lang === 'en' ? 'Your age...' : 'Ton âge...'}
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, saved && styles.saveBtnDone]}
              onPress={handleSave}
            >
              <Feather name={saved ? 'check' : 'save'} size={16} color={COLORS.white} />
              <Text style={styles.saveBtnText}>
                {saved
                  ? (lang === 'ar' ? 'تم الحفظ' : lang === 'en' ? 'Saved!' : 'Sauvegardé !')
                  : (lang === 'ar' ? 'حفظ' : lang === 'en' ? 'Save' : 'Sauvegarder')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── LANGUAGE ── */}
        <Text style={[styles.sectionLabel, isRTL && styles.rtl]}>
          {lang === 'ar' ? 'اللغة' : lang === 'en' ? 'Language' : 'Langue'}
        </Text>
        <View style={styles.card}>
          {LANGUAGES.map((l, i) => (
            <TouchableOpacity
              key={l.code}
              style={[
                styles.langRow,
                i < LANGUAGES.length - 1 && styles.langRowBorder,
                lang === l.code && styles.langRowActive,
              ]}
              onPress={() => changeLang(l.code)}
            >
              <View style={[styles.langIconWrap, lang === l.code && { backgroundColor: COLORS.accent }]}>
                <Feather name="globe" size={16} color={lang === l.code ? COLORS.white : COLORS.subtext} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.langLabel, lang === l.code && { color: COLORS.accent, fontWeight: '700' }]}>
                  {l.label}
                </Text>
                <Text style={styles.langSublabel}>{l.sublabel}</Text>
              </View>
              {lang === l.code && (
                <View style={styles.checkWrap}>
                  <Feather name="check" size={14} color={COLORS.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── AVATARS ── */}
        <Text style={[styles.sectionLabel, isRTL && styles.rtl]}>
          {lang === 'ar' ? 'الشخصيات' : lang === 'en' ? 'Avatars' : 'Avatars'}
        </Text>
        <View style={styles.card}>
          <SettingRow
            icon="edit-3"
            iconColor={COLORS.accent}
            iconBg={COLORS.soft}
            title={lang === 'ar' ? 'إعادة تسمية الشخصيات' : lang === 'en' ? 'Rename avatars' : 'Renommer les avatars'}
            subtitle={lang === 'ar' ? 'خصّص أسماء شخصياتك' : lang === 'en' ? 'Customize avatar names' : 'Personnalise les noms'}
            onPress={() => router.push('/onboarding')}
          />
        </View>

        {/* ── DONNÉES ── */}
        <Text style={[styles.sectionLabel, isRTL && styles.rtl]}>
          {lang === 'ar' ? 'البيانات' : lang === 'en' ? 'Data' : 'Données'}
        </Text>
        <View style={styles.card}>
          <SettingRow
            icon="trash-2"
            iconColor="#c0695a"
            iconBg="#fde8e5"
            title={lang === 'ar' ? 'مسح المحادثات' : lang === 'en' ? 'Clear conversations' : 'Effacer les conversations'}
            subtitle={lang === 'ar' ? 'حذف كل سجل المحادثات' : lang === 'en' ? 'Delete all chat history' : 'Supprimer tout l\'historique'}
            onPress={handleClearAllChats}
            danger
            rightElement={<Feather name="chevron-right" size={16} color="#c0695a" />}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="refresh-ccw"
            iconColor="#c0695a"
            iconBg="#fde8e5"
            title={lang === 'ar' ? 'إعادة الإعداد الأولي' : lang === 'en' ? 'Reset onboarding' : 'Réinitialiser l\'onboarding'}
            subtitle={lang === 'ar' ? 'العودة إلى شاشة الترحيب' : lang === 'en' ? 'Go back to welcome screen' : 'Retourner à l\'écran de bienvenue'}
            onPress={handleResetOnboarding}
            danger
            rightElement={<Feather name="chevron-right" size={16} color="#c0695a" />}
          />
        </View>

        {/* ── ABOUT ── */}
        <View style={styles.aboutCard}>
          <View style={styles.aboutIconWrap}>
            <Feather name="heart" size={24} color={COLORS.accent} />
          </View>
          <Text style={styles.aboutTitle}>هَمْس</Text>
          <Text style={styles.aboutSub}>
            {lang === 'ar' ? 'مساحتك للتنفس والشعور والنمو'
              : lang === 'en' ? 'Your space to breathe, feel and grow'
              : 'Ton espace pour souffler, ressentir et grandir'}
          </Text>
          <View style={styles.aboutBadge}>
            <Text style={styles.aboutBadgeText}>v1.0.0 — ARSII Hackathon 2025</Text>
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
    paddingHorizontal: 20, paddingTop: 14,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.soft,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  scroll: { padding: 20 },

  // Profile
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    gap: 14, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6,
  },
  profileAvatar: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: COLORS.soft,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.border,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 3 },
  profileAge: { fontSize: 13, color: COLORS.subtext },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.soft,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },

  // Edit form
  editForm: {
    backgroundColor: COLORS.white,
    borderRadius: 20, padding: 16,
    marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border,
    gap: 10,
  },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1, paddingVertical: 12,
    fontSize: 14, color: COLORS.text,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 14, paddingVertical: 12,
    marginTop: 4,
  },
  saveBtnDone: { backgroundColor: COLORS.accentDark },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  // Section label
  sectionLabel: {
    fontSize: 12, fontWeight: '700',
    color: COLORS.subtext, marginBottom: 8,
    marginTop: 8, letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 16,
    elevation: 1,
  },

  // Language
  langRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 14, paddingHorizontal: 16,
  },
  langRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  langRowActive: { backgroundColor: COLORS.bgAlt },
  langIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: COLORS.soft,
    justifyContent: 'center', alignItems: 'center',
  },
  langLabel: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  langSublabel: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  checkWrap: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center',
  },

  // Setting row
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, padding: 16,
  },
  settingRowDanger: { backgroundColor: '#fff8f7' },
  settingIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  settingSubtitle: { fontSize: 11, color: COLORS.muted },
  rowDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },

  // About
  aboutCard: {
    backgroundColor: COLORS.text,
    borderRadius: 24, padding: 28,
    alignItems: 'center', marginTop: 8,
  },
  aboutIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.soft + '22',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  aboutTitle: { fontSize: 34, color: COLORS.accentWarm, fontWeight: 'bold', marginBottom: 6 },
  aboutSub: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginBottom: 12, lineHeight: 20 },
  aboutBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  aboutBadgeText: { fontSize: 11, color: COLORS.muted },

  rtl: { textAlign: 'right' },
});