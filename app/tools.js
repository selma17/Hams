import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Animated
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
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
};

// ─── BREATHING EXERCISE ───
function BreathingExercise({ lang, isRTL, onClose }) {
  const [phase, setPhase] = useState('ready'); // ready | inhale | hold | exhale | done
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  const PHASES = {
    inhale: { duration: 4, next: 'hold', label: { fr: 'Inspire...', en: 'Inhale...', ar: 'استنشق...' } },
    hold: { duration: 7, next: 'exhale', label: { fr: 'Retiens...', en: 'Hold...', ar: 'احبس...' } },
    exhale: { duration: 8, next: 'inhale', label: { fr: 'Expire...', en: 'Exhale...', ar: 'ازفر...' } },
  };

  const startBreathing = () => {
    setPhase('inhale');
    setCount(4);
    setCycle(1);
  };

  useEffect(() => {
    if (phase === 'ready' || phase === 'done') return;

    // Animate circle
    if (phase === 'inhale') {
      Animated.timing(scaleAnim, { toValue: 1.6, duration: 4000, useNativeDriver: true }).start();
    } else if (phase === 'exhale') {
      Animated.timing(scaleAnim, { toValue: 1.0, duration: 8000, useNativeDriver: true }).start();
    }

    // Countdown
    setCount(PHASES[phase]?.duration || 4);
    timerRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          const nextPhase = PHASES[phase]?.next;
          if (phase === 'exhale') {
            const newCycle = cycle + 1;
            if (newCycle > 3) {
              setPhase('done');
              return 0;
            }
            setCycle(newCycle);
          }
          setPhase(nextPhase);
          return PHASES[nextPhase]?.duration || 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  const getPhaseLabel = () => {
    if (phase === 'ready') return lang === 'ar' ? 'ابدأ' : lang === 'en' ? 'Ready?' : 'Prêt·e ?';
    if (phase === 'done') return lang === 'ar' ? 'أحسنت! 🌿' : lang === 'en' ? 'Well done! 🌿' : 'Bravo ! 🌿';
    return PHASES[phase]?.label[lang];
  };

  return (
    <View style={styles.exerciseScreen}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseTitle}>
          {lang === 'ar' ? 'تمرين التنفس 4-7-8' : lang === 'en' ? '4-7-8 Breathing' : 'Respiration 4-7-8'}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Feather name="x" size={20} color={COLORS.subtext} />
        </TouchableOpacity>
      </View>

      <Text style={styles.cycleText}>
        {phase !== 'ready' && phase !== 'done'
          ? (lang === 'ar' ? `دورة ${cycle}/3` : lang === 'en' ? `Cycle ${cycle}/3` : `Cycle ${cycle}/3`)
          : ''}
      </Text>

      {/* Animated circle */}
      <View style={styles.circleContainer}>
        <Animated.View style={[styles.circleOuter, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.circleInner}>
            <Text style={styles.circleCount}>{phase !== 'ready' && phase !== 'done' ? count : ''}</Text>
          </View>
        </Animated.View>
      </View>

      <Text style={styles.phaseLabel}>{getPhaseLabel()}</Text>

      {(phase === 'ready' || phase === 'done') && (
        <TouchableOpacity
          style={styles.startBtn}
          onPress={phase === 'done' ? onClose : startBreathing}
        >
          <Text style={styles.startBtnText}>
            {phase === 'done'
              ? (lang === 'ar' ? 'إغلاق' : lang === 'en' ? 'Close' : 'Fermer')
              : (lang === 'ar' ? 'ابدأ' : lang === 'en' ? 'Start' : 'Commencer')}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.breathingNote}>
        {lang === 'ar'
          ? 'تقنية 4-7-8 تهدئ الجهاز العصبي في دقيقتين'
          : lang === 'en'
            ? '4-7-8 technique calms your nervous system in 2 minutes'
            : 'La technique 4-7-8 calme le système nerveux en 2 minutes'}
      </Text>
    </View>
  );
}

// ─── MAIN TOOLS SCREEN ───
export default function Tools() {
  const { t, isRTL, lang } = useLang();
  const [activeScreen, setActiveScreen] = useState(null);
  const [completedChallenge, setCompletedChallenge] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const CHALLENGES = {
    fr: [
      'Dis merci à quelqu\'un aujourd\'hui 🙏',
      'Écris 3 choses positives de ta journée ✍️',
      'Fais une pause de 5 min sans téléphone 📵',
      'Envoie un message à quelqu\'un qui te manque 💌',
      'Bois un grand verre d\'eau maintenant 💧',
      'Fais 10 respirations profondes lentement 🌬️',
      'Souris à un inconnu aujourd\'hui 😊',
    ],
    en: [
      'Say thank you to someone today 🙏',
      'Write 3 positive things about your day ✍️',
      'Take a 5-minute phone break 📵',
      'Message someone you miss 💌',
      'Drink a big glass of water now 💧',
      'Take 10 slow deep breaths 🌬️',
      'Smile at a stranger today 😊',
    ],
    ar: [
      'قل شكراً لشخص ما اليوم 🙏',
      'اكتب 3 أشياء إيجابية عن يومك ✍️',
      'خذ استراحة 5 دقائق بدون هاتف 📵',
      'أرسل رسالة لشخص تشتاق إليه 💌',
      'اشرب كوباً كبيراً من الماء الآن 💧',
      'خذ 10 أنفاس عميقة ببطء 🌬️',
      'ابتسم لغريب اليوم 😊',
    ],
  };

  const getTodayChallenge = () => {
    const list = CHALLENGES[lang] || CHALLENGES.fr;
    const idx = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % list.length;
    return list[idx];
  };

  const GROUNDING = {
    fr: ['5 choses que tu vois 👀', '4 choses que tu touches ✋', '3 choses que tu entends 👂', '2 choses que tu sens 👃', '1 chose que tu goûtes 👅'],
    en: ['5 things you see 👀', '4 things you touch ✋', '3 things you hear 👂', '2 things you smell 👃', '1 thing you taste 👅'],
    ar: ['5 أشياء تراها 👀', '4 أشياء تلمسها ✋', '3 أشياء تسمعها 👂', '2 أشياء تشمها 👃', 'شيء واحد تتذوقه 👅'],
  };

  if (activeScreen === 'breathing') {
    return (
      <SafeAreaView style={styles.container}>
        <BreathingExercise lang={lang} isRTL={isRTL} onClose={() => setActiveScreen(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="wind" size={20} color={COLORS.accent} />
        </View>
        <Text style={styles.headerTitle}>{t.toolsTitle}</Text>
        <View style={{ width: 38 }} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── DAILY CHALLENGE ── */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeTop}>
            <Feather name="star" size={18} color={COLORS.white} />
            <Text style={styles.challengeTag}>
              {lang === 'ar' ? 'تحدي اليوم' : lang === 'en' ? 'Daily Challenge' : 'Défi du jour'}
            </Text>
          </View>
          <Text style={[styles.challengeText, isRTL && styles.rtl]}>
            {getTodayChallenge()}
          </Text>
          <TouchableOpacity
            style={[styles.challengeBtn, completedChallenge && styles.challengeBtnDone]}
            onPress={() => setCompletedChallenge(!completedChallenge)}
          >
            <Feather name={completedChallenge ? 'check-circle' : 'circle'} size={18} color={COLORS.white} />
            <Text style={styles.challengeBtnText}>
              {completedChallenge
                ? (lang === 'ar' ? 'أنجزته! 🎉' : lang === 'en' ? 'Done! 🎉' : 'Accompli ! 🎉')
                : (lang === 'ar' ? 'علّم كمنجز' : lang === 'en' ? 'Mark as done' : 'Marquer comme fait')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── BREATHING ── */}
        <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
          {lang === 'ar' ? 'تمارين التنفس' : lang === 'en' ? 'Breathing' : 'Respiration'}
        </Text>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => setActiveScreen('breathing')}
          activeOpacity={0.85}
        >
          <View style={[styles.toolIconWrap, { backgroundColor: '#a8c5da33' }]}>
            <Feather name="wind" size={24} color="#4a90b8" />
          </View>
          <View style={styles.toolInfo}>
            <Text style={[styles.toolTitle, isRTL && styles.rtl]}>{t.breathing}</Text>
            <Text style={[styles.toolDesc, isRTL && styles.rtl]}>{t.breathingDesc}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={COLORS.muted} />
        </TouchableOpacity>

        {/* ── GROUNDING ── */}
        <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
          {lang === 'ar' ? 'تمرين التأريض 5-4-3-2-1' : lang === 'en' ? '5-4-3-2-1 Grounding' : 'Ancrage 5-4-3-2-1'}
        </Text>

        <View style={styles.groundingCard}>
          <Text style={[styles.groundingDesc, isRTL && styles.rtl]}>
            {lang === 'ar'
              ? 'تقنية قوية لتهدئة الذعر. ركّز على حواسك الخمس:'
              : lang === 'en'
                ? 'Powerful technique to calm panic. Focus on your 5 senses:'
                : 'Technique puissante pour calmer la panique. Concentre-toi sur tes 5 sens :'}
          </Text>
          {(GROUNDING[lang] || GROUNDING.fr).map((item, i) => (
            <View key={i} style={[styles.groundingItem, isRTL && styles.rowReverse]}>
              <View style={[styles.groundingNum, { backgroundColor: COLORS.accent }]}>
                <Text style={styles.groundingNumText}>{5 - i}</Text>
              </View>
              <Text style={[styles.groundingText, isRTL && styles.rtl]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* ── POSITIVE THOUGHTS ── */}
        <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
          {lang === 'ar' ? 'إعادة صياغة الأفكار' : lang === 'en' ? 'Thought Reframing' : 'Recadrage des pensées'}
        </Text>

        <View style={styles.reframeCard}>
          <Text style={[styles.reframeTitle, isRTL && styles.rtl]}>
            {lang === 'ar' ? 'عندما تفكر...' : lang === 'en' ? 'When you think...' : 'Quand tu penses...'}
          </Text>
          {[
            {
              negative: lang === 'ar' ? 'أنا فاشل في كل شيء' : lang === 'en' ? 'I\'m a failure at everything' : 'Je suis nul en tout',
              positive: lang === 'ar' ? 'أنا أتعلم وأنمو في كل يوم' : lang === 'en' ? 'I\'m learning and growing every day' : 'J\'apprends et je grandis chaque jour',
            },
            {
              negative: lang === 'ar' ? 'لا أحد يحبني' : lang === 'en' ? 'Nobody likes me' : 'Personne ne m\'aime',
              positive: lang === 'ar' ? 'أنا شخص يستحق الحب' : lang === 'en' ? 'I am worthy of love and connection' : 'Je mérite l\'amour et la connexion',
            },
            {
              negative: lang === 'ar' ? 'لا يمكنني التعامل مع هذا' : lang === 'en' ? 'I can\'t handle this' : 'Je ne peux pas gérer ça',
              positive: lang === 'ar' ? 'لقد تغلبت على صعوبات من قبل' : lang === 'en' ? 'I\'ve overcome challenges before' : 'J\'ai déjà surmonté des défis',
            },
          ].map((item, i) => (
            <View key={i} style={styles.reframeItem}>
              <View style={[styles.reframeRow, isRTL && styles.rowReverse]}>
                <View style={styles.reframeNegTag}>
                  <Text style={styles.reframeNegTagText}>✗</Text>
                </View>
                <Text style={[styles.reframeNeg, isRTL && styles.rtl]}>{item.negative}</Text>
              </View>
              <View style={[styles.reframeRow, isRTL && styles.rowReverse]}>
                <View style={styles.reframePosTag}>
                  <Text style={styles.reframePosTagText}>✓</Text>
                </View>
                <Text style={[styles.reframePos, isRTL && styles.rtl]}>{item.positive}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.muted,
  },
  headerIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: COLORS.soft,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },

  scroll: { padding: 20, paddingBottom: 40 },

  // Challenge
  challengeCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 24, padding: 20,
    marginBottom: 28,
    elevation: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  challengeTop: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 12,
  },
  challengeTag: { fontSize: 12, fontWeight: '700', color: COLORS.white, letterSpacing: 1 },
  challengeText: {
    fontSize: 16, color: COLORS.white,
    lineHeight: 26, marginBottom: 16, fontWeight: '500',
  },
  challengeBtn: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  challengeBtnDone: { backgroundColor: 'rgba(255,255,255,0.4)' },
  challengeBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },

  // Section
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    color: COLORS.text, marginBottom: 14,
  },

  // Tool card
  toolCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20, padding: 16,
    marginBottom: 28, gap: 14,
    elevation: 2,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 6,
  },
  toolIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  toolInfo: { flex: 1 },
  toolTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  toolDesc: { fontSize: 12, color: COLORS.subtext, lineHeight: 18 },

  // Grounding
  groundingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20, padding: 18,
    marginBottom: 28,
    elevation: 2,
  },
  groundingDesc: {
    fontSize: 13, color: COLORS.subtext,
    marginBottom: 16, lineHeight: 20, fontStyle: 'italic',
  },
  groundingItem: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 10,
  },
  groundingNum: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  groundingNumText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  groundingText: { fontSize: 14, color: COLORS.text, flex: 1 },

  // Reframe
  reframeCard: {
    backgroundColor: COLORS.soft,
    borderRadius: 20, padding: 18,
    elevation: 2,
  },
  reframeTitle: {
    fontSize: 14, fontWeight: '700',
    color: COLORS.text, marginBottom: 16,
  },
  reframeItem: {
    backgroundColor: COLORS.white,
    borderRadius: 14, padding: 14,
    marginBottom: 10, gap: 8,
  },
  reframeRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  reframeNegTag: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#ffb3b3',
    justifyContent: 'center', alignItems: 'center',
  },
  reframeNegTagText: { fontSize: 12, fontWeight: '800', color: '#cc0000' },
  reframePosTag: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#b3e6b3',
    justifyContent: 'center', alignItems: 'center',
  },
  reframePosTagText: { fontSize: 12, fontWeight: '800', color: '#2d7a2d' },
  reframeNeg: { fontSize: 13, color: '#cc4444', flex: 1, lineHeight: 20 },
  reframePos: { fontSize: 13, color: '#2d7a2d', flex: 1, lineHeight: 20, fontWeight: '600' },

  // Breathing screen
  exerciseScreen: { flex: 1, padding: 24 },
  exerciseHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  exerciseTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.soft,
    justifyContent: 'center', alignItems: 'center',
  },
  cycleText: {
    fontSize: 13, color: COLORS.subtext,
    textAlign: 'center', marginBottom: 20,
    height: 20,
  },
  circleContainer: {
    alignItems: 'center', justifyContent: 'center',
    height: 220, marginBottom: 30,
  },
  circleOuter: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: COLORS.accent + '33',
    justifyContent: 'center', alignItems: 'center',
  },
  circleInner: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  circleCount: { fontSize: 40, fontWeight: '800', color: COLORS.white },
  phaseLabel: {
    fontSize: 24, fontWeight: '700',
    color: COLORS.text, textAlign: 'center',
    marginBottom: 30,
  },
  startBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 20, paddingVertical: 16,
    paddingHorizontal: 48,
    alignSelf: 'center', elevation: 4,
  },
  startBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  breathingNote: {
    fontSize: 12, color: COLORS.subtext,
    textAlign: 'center', marginTop: 24,
    fontStyle: 'italic', lineHeight: 18,
  },

  rtl: { textAlign: 'right' },
});