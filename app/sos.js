import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Linking, Animated
} from 'react-native';
import { useEffect, useRef } from 'react';
import { useLang } from '../context/LangContext';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  bg: '#fefae0',
  card: '#faedcd',
  accent: '#d4a373',
  soft: '#e9edc9',
  muted: '#ccd5ae',
  text: '#5c4a2a',
  subtext: '#8a7560',
  white: '#ffffff',
  danger: '#e63946',
  dangerLight: '#ffd6d8',
};

const RESOURCES = {
  fr: [
    { name: 'Ligne d\'écoute Tunisie', number: '71 391 474', desc: 'Disponible 24h/24 — Gratuit', icon: 'phone' },
    { name: 'Centre de santé mentale', number: '71 562 100', desc: 'Hôpital Razi, Tunis', icon: 'heart' },
    { name: 'Urgences', number: '190', desc: 'Police nationale — Urgences', icon: 'alert-circle' },
    { name: 'SAMU', number: '190', desc: 'Urgences médicales', icon: 'activity' },
  ],
  en: [
    { name: 'Tunisia Listening Line', number: '71 391 474', desc: 'Available 24/7 — Free', icon: 'phone' },
    { name: 'Mental Health Center', number: '71 562 100', desc: 'Razi Hospital, Tunis', icon: 'heart' },
    { name: 'Emergency', number: '190', desc: 'National Police — Emergency', icon: 'alert-circle' },
    { name: 'Medical Emergency', number: '190', desc: 'Medical emergencies', icon: 'activity' },
  ],
  ar: [
    { name: 'خط الاستماع التونسي', number: '71 391 474', desc: 'متاح 24/7 — مجاني', icon: 'phone' },
    { name: 'مركز الصحة النفسية', number: '71 562 100', desc: 'مستشفى الرازي، تونس', icon: 'heart' },
    { name: 'الطوارئ', number: '190', desc: 'الشرطة الوطنية — طوارئ', icon: 'alert-circle' },
    { name: 'الإسعاف', number: '190', desc: 'الطوارئ الطبية', icon: 'activity' },
  ],
};

const MESSAGES = {
  fr: [
    'Tu n\'es pas seul·e. Des gens sont là pour toi. 🤍',
    'Ce que tu ressens est réel et valide.',
    'Demander de l\'aide, c\'est un acte de courage.',
    'Tu as survécu à tous tes pires jours jusqu\'ici.',
    'Cette douleur est temporaire. Tu peux traverser ça.',
  ],
  en: [
    'You are not alone. People are here for you. 🤍',
    'What you feel is real and valid.',
    'Asking for help is an act of courage.',
    'You have survived all your worst days so far.',
    'This pain is temporary. You can get through this.',
  ],
  ar: [
    'أنت لست وحدك. هناك من يهتم بك. 🤍',
    'ما تشعر به حقيقي ومهم.',
    'طلب المساعدة هو شجاعة.',
    'لقد تجاوزت أصعب أيامك حتى الآن.',
    'هذا الألم مؤقت. يمكنك تجاوزه.',
  ],
};

export default function SOS() {
  const { lang, isRTL } = useLang();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const resources = RESOURCES[lang] || RESOURCES.fr;
  const messages = MESSAGES[lang] || MESSAGES.fr;
  const todayMsg = messages[Math.floor(Date.now() / (6 * 60 * 60 * 1000)) % messages.length];

  const callNumber = (number) => {
    Linking.openURL(`tel:${number.replace(/\s/g, '')}`);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Animated.View style={[styles.sosCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Feather name="alert-circle" size={28} color={COLORS.white} />
        </Animated.View>
        <Text style={styles.headerTitle}>SOS</Text>
        <View style={{ width: 44 }} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── MESSAGE DE SOUTIEN ── */}
        <View style={styles.supportCard}>
          <Feather name="heart" size={20} color={COLORS.accent} style={{ marginBottom: 10 }} />
          <Text style={[styles.supportText, isRTL && styles.rtl]}>{todayMsg}</Text>
        </View>

        {/* ── RESPIRE ── */}
        <View style={styles.breatheCard}>
          <Text style={[styles.breatheTitle, isRTL && styles.rtl]}>
            {lang === 'ar' ? '🌬️ تنفس معي الآن' : lang === 'en' ? '🌬️ Breathe with me now' : '🌬️ Respire avec moi maintenant'}
          </Text>
          <Text style={[styles.breatheSteps, isRTL && styles.rtl]}>
            {lang === 'ar'
              ? 'استنشق 4 ثوانٍ → احبس 4 ثوانٍ → ازفر 4 ثوانٍ'
              : lang === 'en'
                ? 'Inhale 4s → Hold 4s → Exhale 4s'
                : 'Inspire 4s → Retiens 4s → Expire 4s'}
          </Text>
        </View>

        {/* ── RESSOURCES ── */}
        <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
          {lang === 'ar' ? 'اتصل الآن' : lang === 'en' ? 'Call now' : 'Appelle maintenant'}
        </Text>

        {resources.map((r, i) => (
          <TouchableOpacity
            key={i}
            style={styles.resourceCard}
            onPress={() => callNumber(r.number)}
            activeOpacity={0.85}
          >
            <View style={[styles.resourceLeft, isRTL && styles.rowReverse]}>
              <View style={styles.resourceIcon}>
                <Feather name={r.icon} size={20} color={COLORS.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.resourceName, isRTL && styles.rtl]}>{r.name}</Text>
                <Text style={[styles.resourceDesc, isRTL && styles.rtl]}>{r.desc}</Text>
              </View>
            </View>
            <View style={styles.callBtn}>
              <Text style={styles.callNumber}>{r.number}</Text>
              <Feather name="phone-call" size={14} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        ))}

        {/* ── TU N'ES PAS SEUL ── */}
        <View style={styles.bottomCard}>
          <Text style={[styles.bottomTitle, isRTL && styles.rtl]}>
            {lang === 'ar' ? 'تذكر دائماً' : lang === 'en' ? 'Always remember' : 'Rappelle-toi toujours'}
          </Text>
          <Text style={[styles.bottomText, isRTL && styles.rtl]}>
            {lang === 'ar'
              ? 'طلب المساعدة ليس ضعفاً — إنه أشجع شيء يمكنك فعله. أنت تستحق الدعم والرعاية.'
              : lang === 'en'
                ? 'Asking for help is not weakness — it\'s the bravest thing you can do. You deserve support and care.'
                : 'Demander de l\'aide n\'est pas une faiblesse — c\'est l\'acte de courage le plus fort. Tu mérites soutien et bienveillance.'}
          </Text>
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
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.muted,
  },
  sosCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.danger,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 6,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.danger },

  scroll: { padding: 20 },

  supportCard: {
    backgroundColor: COLORS.soft,
    borderRadius: 20, padding: 20,
    alignItems: 'center', marginBottom: 16,
  },
  supportText: {
    fontSize: 16, color: COLORS.text,
    textAlign: 'center', lineHeight: 26,
    fontStyle: 'italic', fontWeight: '500',
  },

  breatheCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20, padding: 18,
    marginBottom: 24,
  },
  breatheTitle: {
    fontSize: 15, fontWeight: '700',
    color: COLORS.text, marginBottom: 8,
  },
  breatheSteps: {
    fontSize: 13, color: COLORS.subtext,
    lineHeight: 22,
  },

  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    color: COLORS.text, marginBottom: 12,
  },

  resourceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20, padding: 16,
    marginBottom: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    elevation: 2,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6,
    borderLeftWidth: 4, borderLeftColor: COLORS.danger,
  },
  resourceLeft: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, flex: 1,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  resourceIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.dangerLight,
    justifyContent: 'center', alignItems: 'center',
  },
  resourceName: {
    fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2,
  },
  resourceDesc: { fontSize: 11, color: COLORS.subtext },
  callBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: 12, paddingHorizontal: 12,
    paddingVertical: 8, alignItems: 'center', gap: 4,
  },
  callNumber: { fontSize: 12, fontWeight: '800', color: COLORS.white },

  bottomCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 20, padding: 20, marginTop: 8,
  },
  bottomTitle: {
    fontSize: 15, fontWeight: '800',
    color: COLORS.white, marginBottom: 8,
  },
  bottomText: {
    fontSize: 13, color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },

  rtl: { textAlign: 'right' },
});