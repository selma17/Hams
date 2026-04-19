import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Dimensions, Animated
} from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../context/LangContext';
import { AVATARS } from '../constants/avatars';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import EmotionWheel from '../components/EmotionWheel';
const { width } = Dimensions.get('window');


const QUOTES = {
  fr: [
    { text: "Tes émotions sont valides. Tu n'as pas à les justifier.", author: "هَمْس" },
    { text: "Chaque jour est une nouvelle chance de prendre soin de toi.", author: "هَمْس" },
    { text: "Tu n'es pas seul·e dans ce que tu ressens.", author: "هَمْس" },
    { text: "La vulnérabilité est une forme de courage.", author: "Brené Brown" },
    { text: "Prendre soin de soi n'est pas un luxe, c'est une nécessité.", author: "هَمْس" },
  ],
  en: [
    { text: "Your feelings are valid. You don't have to justify them.", author: "هَمْس" },
    { text: "Every day is a new chance to take care of yourself.", author: "هَمْس" },
    { text: "You are not alone in what you feel.", author: "هَمْس" },
    { text: "Vulnerability is a form of courage.", author: "Brené Brown" },
    { text: "Self-care is not a luxury, it's a necessity.", author: "هَمْس" },
  ],
  ar: [
    { text: "مشاعرك حقيقية. لست مضطراً لتبريرها.", author: "هَمْس" },
    { text: "كل يوم هو فرصة جديدة للاعتناء بنفسك.", author: "هَمْس" },
    { text: "لست وحدك فيما تشعر به.", author: "هَمْس" },
    { text: "الضعف أمام النفس شكل من أشكال الشجاعة.", author: "هَمْس" },
    { text: "الاعتناء بالنفس ليس رفاهية، بل ضرورة.", author: "هَمْس" },
  ],
};

const MOODS = [
  { icon: 'emoticon-cry-outline', label: { fr: 'Triste', en: 'Sad', ar: 'حزين' }, color: '#a8c5da' },
  { icon: 'emoticon-confused-outline', label: { fr: 'Anxieux', en: 'Anxious', ar: 'قلق' }, color: '#b5c8a8' },
  { icon: 'emoticon-neutral-outline', label: { fr: 'Neutre', en: 'Neutral', ar: 'محايد' }, color: '#ccd5ae' },
  { icon: 'emoticon-outline', label: { fr: 'Bien', en: 'Good', ar: 'بخير' }, color: '#d4a373' },
  { icon: 'emoticon-happy-outline', label: { fr: 'Heureux', en: 'Happy', ar: 'سعيد' }, color: '#e9a87c' },
  { icon: 'emoticon-excited-outline', label: { fr: 'Super', en: 'Great', ar: 'رائع' }, color: '#c17f5a' },
];

const AVATAR_DESC_KEYS = {
  jule: 'jule_desc', leo: 'leo_desc',
  nyx: 'nyx_desc', sage: 'sage_desc', echo: 'echo_desc',
};

const AVATAR_ICONS = {
  jule: { name: 'zap', lib: 'feather' },
  leo: { name: 'leaf', lib: 'feather' },
  nyx: { name: 'flame', lib: 'ionicons' },
  sage: { name: 'book-open', lib: 'feather' },
  echo: { name: 'repeat', lib: 'feather' },
};

function AvatarIcon({ avatarId, size, color }) {
  const icon = AVATAR_ICONS[avatarId];
  if (!icon) return null;
  if (icon.lib === 'ionicons') return <Ionicons name={icon.name} size={size} color={color} />;
  return <Feather name={icon.name} size={size} color={color} />;
}

export default function Home() {
  const router = useRouter();
  const { t, isRTL, lang } = useLang();
  const [userName, setUserName] = useState('');
  const [avatarNames, setAvatarNames] = useState({});
  const [selectedMood, setSelectedMood] = useState(null);
  const [quote, setQuote] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const load = async () => {
      const name = await AsyncStorage.getItem('userName');
      const names = await AsyncStorage.getItem('avatarNames');
      if (name) setUserName(name);
      if (names) setAvatarNames(JSON.parse(names));
    };
    load();

    const quotes = QUOTES[lang] || QUOTES.fr;
    const idx = Math.floor(Date.now() / (6 * 60 * 60 * 1000)) % quotes.length;
    setQuote(quotes[idx]);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, [lang]);

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (lang === 'ar') {
      if (h < 12) return 'صباح الخير';
      if (h < 18) return 'مساء الخير';
      return 'مساء النور';
    }
    if (lang === 'en') {
      if (h < 12) return 'Good morning';
      if (h < 18) return 'Good afternoon';
      return 'Good evening';
    }
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getTimeIcon = () => {
    const h = new Date().getHours();
    if (h < 6 || h >= 20) return <Feather name="moon" size={22} color={COLORS.accent} />;
    if (h < 12) return <Feather name="sunrise" size={22} color={COLORS.accent} />;
    if (h < 18) return <Feather name="sun" size={22} color={COLORS.accent} />;
    return <Feather name="sunset" size={22} color={COLORS.accent} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HEADER ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.timeIconWrap}>{getTimeIcon()}</View>
              <View>
                <Text style={[styles.greeting, isRTL && styles.rtl]}>
                  {getTimeGreeting()}, <Text style={styles.greetingName}>{userName}</Text>
                </Text>
                <Text style={[styles.howAreYou, isRTL && styles.rtl]}>
                  {t.howAreYou}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.appBadge}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.appBadgeText}>هَمْس</Text>
              <Feather name="settings" size={12} color={COLORS.white} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── QUOTE CARD ── */}
        {quote && (
          <Animated.View style={[styles.quoteCard, { opacity: fadeAnim }]}>
            <View style={styles.quoteIconWrap}>
              <Feather name="message-circle" size={18} color="rgba(255,255,255,0.7)" />
            </View>
            <Text style={[styles.quoteText, isRTL && styles.rtl]}>{quote.text}</Text>
            <View style={styles.quoteFooter}>
              <View style={styles.quoteLine} />
              <Text style={styles.quoteAuthor}>{quote.author}</Text>
            </View>
          </Animated.View>
        )}

        {/* ── MOOD ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
            {lang === 'ar' ? 'كيف تشعر الآن؟' : lang === 'en' ? 'How do you feel?' : 'Comment tu te sens ?'}
          </Text>
          <View style={styles.moodRow}>
            {MOODS.map((mood, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.moodBtn,
                  selectedMood === i && { borderColor: mood.color, backgroundColor: mood.color + '22' }
                ]}
                onPress={() => setSelectedMood(i)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={mood.icon}
                  size={26}
                  color={selectedMood === i ? mood.color : COLORS.subtext}
                />
                <Text style={[
                  styles.moodLabel,
                  selectedMood === i && { color: mood.color, fontWeight: '700' }
                ]}>
                  {mood.label[lang]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
        {/* ── EMOTION WHEEL ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
            {lang === 'ar' ? 'عجلة المشاعر' : lang === 'en' ? 'Emotion Wheel' : 'Roue des émotions'}
          </Text>
          <EmotionWheel lang={lang} isRTL={isRTL} />
        </Animated.View>
        {/* ── AVATARS ── */}
        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>{t.talkTo}</Text>
            <Feather name="chevron-right" size={18} color={COLORS.subtext} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarScroll}>
            {AVATARS.map((avatar) => (
              <TouchableOpacity
                key={avatar.id}
                style={styles.avatarCard}
                onPress={() => router.push({ pathname: '/chat', params: { avatarId: avatar.id } })}
                activeOpacity={0.85}
              >
                <View style={[styles.avatarIconWrap, { backgroundColor: avatar.color + '25' }]}>
                  <AvatarIcon avatarId={avatar.id} size={26} color={avatar.color} />
                </View>
                <Text style={styles.avatarName} numberOfLines={1}>
                  {avatarNames[avatar.id] || avatar.defaultName}
                </Text>
                <Text style={styles.avatarDesc} numberOfLines={2}>
                  {t[AVATAR_DESC_KEYS[avatar.id]]}
                </Text>
                <View style={[styles.avatarPill, { backgroundColor: avatar.color + '33' }]}>
                  <Text style={[styles.avatarPillText, { color: avatar.color }]}>
                    {lang === 'ar' ? 'تحدث' : lang === 'en' ? 'Chat' : 'Parler'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── QUICK ACTIONS ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.actionsGrid}>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.soft }]}
              onPress={() => router.push('/journal')}
              activeOpacity={0.85}
            >
              <View style={styles.actionIconWrap}>
                <Feather name="book" size={22} color={COLORS.accent} />
              </View>
              <Text style={styles.actionTitle}>{t.journal}</Text>
              <Text style={styles.actionSub}>
                {lang === 'ar' ? 'سجّل مشاعرك' : lang === 'en' ? 'Write your feelings' : 'Écris ce que tu ressens'}
              </Text>
              <Feather name="arrow-right" size={14} color={COLORS.accent} style={{ marginTop: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.card }]}
              onPress={() => router.push('/tools')}
              activeOpacity={0.85}
            >
              <View style={styles.actionIconWrap}>
                <Feather name="wind" size={22} color={COLORS.accent} />
              </View>
              <Text style={styles.actionTitle}>{t.tools}</Text>
              <Text style={styles.actionSub}>
                {lang === 'ar' ? 'تمارين وتقنيات' : lang === 'en' ? 'Exercises & techniques' : 'Exercices & techniques'}
              </Text>
              <Feather name="arrow-right" size={14} color={COLORS.accent} style={{ marginTop: 8 }} />
            </TouchableOpacity>

          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 20 },

  // Header
  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center', alignItems: 'center',
  },
  greeting: { fontSize: 19, fontWeight: '800', color: COLORS.text },
  howAreYou: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  appBadge: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  appBadgeText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

  // Quote
  quoteCard: {
    marginHorizontal: 24, marginTop: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 24, padding: 22,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  quoteIconWrap: { marginBottom: 10 },
  quoteText: {
    fontSize: 14, color: COLORS.white,
    lineHeight: 23, fontStyle: 'italic', marginBottom: 14,
  },
  quoteFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quoteLine: { width: 28, height: 1.5, backgroundColor: 'rgba(255,255,255,0.4)' },
  quoteAuthor: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

  // Section
  section: { marginTop: 28, paddingHorizontal: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 24, marginTop: 28, marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 14 },

  // Mood
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 10,
    width: (width - 48 - 50) / 6,
    borderWidth: 2, borderColor: 'transparent',
  },
  moodLabel: { fontSize: 9, color: COLORS.subtext, textAlign: 'center', marginTop: 4 },

  // Avatars
  avatarScroll: { paddingLeft: 24, paddingRight: 12 },
  avatarCard: {
    backgroundColor: COLORS.card, borderRadius: 22,
    padding: 16, marginRight: 12,
    alignItems: 'center', width: 112,
    elevation: 3,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  avatarIconWrap: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  avatarName: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4, textAlign: 'center' },
  avatarDesc: { fontSize: 10, color: COLORS.subtext, textAlign: 'center', lineHeight: 14, marginBottom: 10 },
  avatarPill: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  avatarPillText: { fontSize: 10, fontWeight: '700' },

  // Actions
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1, borderRadius: 22, padding: 20,
    elevation: 2,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  actionIconWrap: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  actionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  actionSub: { fontSize: 11, color: COLORS.subtext, lineHeight: 16 },

  rtl: { textAlign: 'right' },
  greetingName: {
    color: COLORS.accent,
    fontWeight: '900',
  },
});