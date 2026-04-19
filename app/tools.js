import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Animated, Dimensions
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LangContext';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#fdfbf4', card: '#ffffff', accent: '#7cb87a',
  accentDark: '#5a9658', soft: '#f0ece0', text: '#3d3828',
  subtext: '#7a7455', muted: '#b8b49a', white: '#ffffff',
  border: '#e2dcc8', warm: '#d4a373', warmLight: '#f6efcb',
};

// ─── BREATHING ───
function BreathingExercise({ lang, isRTL, onClose }) {
  const [phase, setPhase] = useState('ready');
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const timerRef = useRef(null);

  const PHASES = {
    inhale: { duration: 4, next: 'hold', label: { fr: 'Inspire...', en: 'Inhale...', ar: 'استنشق...' }, color: '#7cb87a' },
    hold: { duration: 7, next: 'exhale', label: { fr: 'Retiens...', en: 'Hold...', ar: 'احبس...' }, color: '#d4a373' },
    exhale: { duration: 8, next: 'inhale', label: { fr: 'Expire...', en: 'Exhale...', ar: 'ازفر...' }, color: '#6bb5e6' },
  };

  const startBreathing = () => { setPhase('inhale'); setCount(4); setCycle(1); };

  useEffect(() => {
    if (phase === 'ready' || phase === 'done') return;
    const phaseColor = PHASES[phase]?.color || COLORS.accent;

    if (phase === 'inhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1.7, duration: 4000, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
      ]).start();
    } else if (phase === 'exhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 8000, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.5, duration: 8000, useNativeDriver: true }),
      ]).start();
    }

    setCount(PHASES[phase]?.duration || 4);
    timerRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          const nextPhase = PHASES[phase]?.next;
          if (phase === 'exhale') {
            const newCycle = cycle + 1;
            if (newCycle > 3) { setPhase('done'); return 0; }
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

  const phaseColor = PHASES[phase]?.color || COLORS.accent;

  return (
    <View style={bStyles.container}>
      <View style={bStyles.header}>
        <Text style={bStyles.title}>
          {lang === 'ar' ? 'تمرين التنفس 4-7-8' : lang === 'en' ? '4-7-8 Breathing' : 'Respiration 4-7-8'}
        </Text>
        <TouchableOpacity onPress={onClose} style={bStyles.closeBtn}>
          <Feather name="x" size={20} color={COLORS.subtext} />
        </TouchableOpacity>
      </View>

      {phase !== 'ready' && phase !== 'done' && (
        <Text style={bStyles.cycleText}>
          {lang === 'ar' ? `دورة ${cycle}/3` : `Cycle ${cycle}/3`}
        </Text>
      )}

      <View style={bStyles.circleWrap}>
        <Animated.View style={[bStyles.circleOuter, {
          backgroundColor: phaseColor + '22',
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }]} />
        <View style={[bStyles.circleInner, { backgroundColor: phaseColor }]}>
          {phase !== 'ready' && phase !== 'done' && (
            <Text style={bStyles.countText}>{count}</Text>
          )}
          {phase === 'done' && <Feather name="check" size={36} color={COLORS.white} />}
          {phase === 'ready' && <Feather name="wind" size={36} color={COLORS.white} />}
        </View>
      </View>

      <Text style={bStyles.phaseLabel}>
        {phase === 'ready' ? (lang === 'ar' ? 'استعد...' : lang === 'en' ? 'Get ready...' : 'Prêt·e...')
          : phase === 'done' ? (lang === 'ar' ? 'أحسنت! 🌿' : lang === 'en' ? 'Well done! 🌿' : 'Bravo ! 🌿')
          : PHASES[phase]?.label[lang]}
      </Text>

      {/* Phase indicators */}
      {phase !== 'ready' && phase !== 'done' && (
        <View style={bStyles.phaseRow}>
          {['inhale', 'hold', 'exhale'].map(p => (
            <View key={p} style={[bStyles.phasePill, phase === p && { backgroundColor: PHASES[p].color }]}>
              <Text style={[bStyles.phasePillText, phase === p && { color: COLORS.white }]}>
                {p === 'inhale' ? (lang === 'ar' ? '4' : '4s')
                  : p === 'hold' ? (lang === 'ar' ? '7' : '7s')
                  : (lang === 'ar' ? '8' : '8s')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {(phase === 'ready' || phase === 'done') && (
        <TouchableOpacity
          style={[bStyles.startBtn, { backgroundColor: COLORS.accent }]}
          onPress={phase === 'done' ? onClose : startBreathing}
        >
          <Text style={bStyles.startBtnText}>
            {phase === 'done'
              ? (lang === 'ar' ? 'إغلاق' : lang === 'en' ? 'Close' : 'Fermer')
              : (lang === 'ar' ? 'ابدأ' : lang === 'en' ? 'Start' : 'Commencer')}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={bStyles.note}>
        {lang === 'ar' ? 'تقنية 4-7-8 تهدئ الجهاز العصبي في دقيقتين'
          : lang === 'en' ? '4-7-8 calms your nervous system in 2 minutes'
          : 'La technique 4-7-8 calme le système nerveux en 2 minutes'}
      </Text>
    </View>
  );
}

const bStyles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.soft, justifyContent: 'center', alignItems: 'center' },
  cycleText: { fontSize: 13, color: COLORS.subtext, marginBottom: 20 },
  circleWrap: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  circleOuter: { position: 'absolute', width: 180, height: 180, borderRadius: 90 },
  circleInner: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  countText: { fontSize: 44, fontWeight: '800', color: COLORS.white },
  phaseLabel: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  phaseRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  phasePill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.soft, borderWidth: 1, borderColor: COLORS.border },
  phasePillText: { fontSize: 13, fontWeight: '700', color: COLORS.subtext },
  startBtn: { borderRadius: 20, paddingVertical: 16, paddingHorizontal: 48, elevation: 4 },
  startBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  note: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 20, fontStyle: 'italic', lineHeight: 18 },
});

// ─── GROUNDING INTERACTIVE ───
function GroundingExercise({ lang, isRTL, onClose }) {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const STEPS = {
    fr: [
      { num: 5, sense: '👀', title: 'Tu vois', prompt: 'Nomme 5 choses que tu vois autour de toi en ce moment', color: '#f2c94c' },
      { num: 4, sense: '✋', title: 'Tu touches', prompt: 'Touche 4 objets et décris leur texture (doux, rugueux, lisse...)', color: '#7cb87a' },
      { num: 3, sense: '👂', title: 'Tu entends', prompt: 'Écoute attentivement et nomme 3 sons dans ton environnement', color: '#6bb5e6' },
      { num: 2, sense: '👃', title: 'Tu sens', prompt: 'Identifie 2 odeurs dans l\'air ou autour de toi', color: '#b39ddb' },
      { num: 1, sense: '👅', title: 'Tu goûtes', prompt: 'Prends conscience d\'un goût dans ta bouche en ce moment', color: '#e07a5f' },
    ],
    en: [
      { num: 5, sense: '👀', title: 'You see', prompt: 'Name 5 things you can see around you right now', color: '#f2c94c' },
      { num: 4, sense: '✋', title: 'You touch', prompt: 'Touch 4 objects and describe their texture (soft, rough, smooth...)', color: '#7cb87a' },
      { num: 3, sense: '👂', title: 'You hear', prompt: 'Listen carefully and name 3 sounds in your environment', color: '#6bb5e6' },
      { num: 2, sense: '👃', title: 'You smell', prompt: 'Identify 2 smells in the air or around you', color: '#b39ddb' },
      { num: 1, sense: '👅', title: 'You taste', prompt: 'Notice one taste in your mouth right now', color: '#e07a5f' },
    ],
    ar: [
      { num: 5, sense: '👀', title: 'تراه', prompt: 'سمِّ 5 أشياء تراها حولك الآن', color: '#f2c94c' },
      { num: 4, sense: '✋', title: 'تلمسه', prompt: 'المس 4 أشياء وصف ملمسها (ناعم، خشن، أملس...)', color: '#7cb87a' },
      { num: 3, sense: '👂', title: 'تسمعه', prompt: 'استمع جيداً وسمِّ 3 أصوات في محيطك', color: '#6bb5e6' },
      { num: 2, sense: '👃', title: 'تشمه', prompt: 'حدد رائحتين في الهواء أو حولك', color: '#b39ddb' },
      { num: 1, sense: '👅', title: 'تتذوقه', prompt: 'انتبه لطعم واحد في فمك الآن', color: '#e07a5f' },
    ],
  };

  const steps = STEPS[lang] || STEPS.fr;
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const goNext = () => {
    if (isLast) { onClose(); return; }
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep(prev => prev + 1);
  };

  return (
    <View style={gStyles.container}>
      <View style={gStyles.header}>
        <Text style={gStyles.title}>
          {lang === 'ar' ? 'تأريض 5-4-3-2-1' : lang === 'en' ? '5-4-3-2-1 Grounding' : 'Ancrage 5-4-3-2-1'}
        </Text>
        <TouchableOpacity onPress={onClose} style={gStyles.closeBtn}>
          <Feather name="x" size={20} color={COLORS.subtext} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={gStyles.progressRow}>
        {steps.map((s, i) => (
          <View key={i} style={[gStyles.progressDot, {
            backgroundColor: i <= step ? s.color : COLORS.border,
            width: i === step ? 24 : 10,
          }]} />
        ))}
      </View>

      <Animated.View style={[gStyles.card, { borderColor: current.color, opacity: fadeAnim }]}>
        <View style={[gStyles.numCircle, { backgroundColor: current.color }]}>
          <Text style={gStyles.numText}>{current.num}</Text>
        </View>
        <Text style={gStyles.sense}>{current.sense}</Text>
        <Text style={[gStyles.cardTitle, { color: current.color }]}>{current.title}</Text>
        <Text style={[gStyles.cardPrompt, isRTL && gStyles.rtl]}>{current.prompt}</Text>
      </Animated.View>

      <TouchableOpacity style={[gStyles.nextBtn, { backgroundColor: current.color }]} onPress={goNext}>
        <Text style={gStyles.nextBtnText}>
          {isLast
            ? (lang === 'ar' ? 'انتهيت 🌿' : lang === 'en' ? 'Done 🌿' : 'Terminé 🌿')
            : (lang === 'ar' ? 'التالي ←' : lang === 'en' ? 'Next →' : 'Suivant →')}
        </Text>
      </TouchableOpacity>

      <Text style={gStyles.note}>
        {lang === 'ar' ? 'هذه التقنية تعيدك إلى اللحظة الحاضرة وتوقف الذعر'
          : lang === 'en' ? 'This technique brings you back to the present and stops panic'
          : 'Cette technique te ramène au moment présent et stoppe la panique'}
      </Text>
    </View>
  );
}

const gStyles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.soft, justifyContent: 'center', alignItems: 'center' },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 30, alignItems: 'center' },
  progressDot: { height: 10, borderRadius: 5 },
  card: { width: '100%', backgroundColor: COLORS.white, borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 2, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 24 },
  numCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  numText: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  sense: { fontSize: 40, marginBottom: 8 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  cardPrompt: { fontSize: 15, color: COLORS.text, textAlign: 'center', lineHeight: 24 },
  nextBtn: { borderRadius: 20, paddingVertical: 16, paddingHorizontal: 48, elevation: 4 },
  nextBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  note: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 20, fontStyle: 'italic', lineHeight: 18 },
  rtl: { textAlign: 'right' },
});

// ─── REFRAMING QUIZ ───
function ReframingExercise({ lang, isRTL, onClose }) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const SCENARIOS = {
    fr: [
      {
        thought: '"Je suis nul·le en tout."',
        question: 'Est-ce vraiment TOUT, sans exception ?',
        options: ['Oui, tout vraiment', 'En fait... pas vraiment', 'Je ne sais pas'],
        reframe: 'Ton cerveau généralise. Pense à une chose où tu t\'es bien débrouillé·e cette semaine. Elle existe.',
        color: '#e07a5f',
      },
      {
        thought: '"Personne ne m\'aime."',
        question: 'Y a-t-il UNE personne qui t\'a souri sincèrement ?',
        options: ['Non, personne', 'Oui, il y en a une', 'Peut-être'],
        reframe: 'La pensée "personne" est une exagération. Un seul sourire sincère prouve que cette pensée est fausse.',
        color: '#6bb5e6',
      },
      {
        thought: '"Je vais rater."',
        question: 'As-tu des preuves concrètes que tu vas rater ?',
        options: ['Oui, des preuves claires', 'Non, c\'est une peur', 'Je ne suis pas sûr·e'],
        reframe: 'Prédire l\'échec sans preuves est une distorsion cognitive. Tu confonds la peur avec la réalité.',
        color: '#b39ddb',
      },
    ],
    en: [
      {
        thought: '"I\'m bad at everything."',
        question: 'Is it really EVERYTHING, without exception?',
        options: ['Yes, really everything', 'Actually... not really', 'I don\'t know'],
        reframe: 'Your brain is overgeneralizing. Think of one thing you did well this week. It exists.',
        color: '#e07a5f',
      },
      {
        thought: '"Nobody likes me."',
        question: 'Is there ONE person who smiled at you sincerely?',
        options: ['No, nobody', 'Yes, there is one', 'Maybe'],
        reframe: 'The thought "nobody" is an exaggeration. One sincere smile proves this thought is false.',
        color: '#6bb5e6',
      },
      {
        thought: '"I\'m going to fail."',
        question: 'Do you have concrete evidence you\'ll fail?',
        options: ['Yes, clear evidence', 'No, it\'s just fear', 'I\'m not sure'],
        reframe: 'Predicting failure without evidence is a cognitive distortion. You\'re confusing fear with reality.',
        color: '#b39ddb',
      },
    ],
    ar: [
      {
        thought: '"أنا فاشل في كل شيء."',
        question: 'هل هو كل شيء حقاً، بدون استثناء؟',
        options: ['نعم، كل شيء', 'في الواقع... ليس كذلك', 'لا أعرف'],
        reframe: 'دماغك يعمّم. فكّر في شيء واحد أجدت فيه هذا الأسبوع. إنه موجود.',
        color: '#e07a5f',
      },
      {
        thought: '"لا أحد يحبني."',
        question: 'هل هناك شخص واحد ابتسم لك بصدق؟',
        options: ['لا، لا أحد', 'نعم، هناك شخص', 'ربما'],
        reframe: 'فكرة "لا أحد" مبالغة. ابتسامة صادقة واحدة تثبت أن هذه الفكرة خاطئة.',
        color: '#6bb5e6',
      },
      {
        thought: '"سأفشل."',
        question: 'هل لديك دليل ملموس على الفشل؟',
        options: ['نعم، أدلة واضحة', 'لا، إنه خوف فقط', 'لست متأكداً'],
        reframe: 'التنبؤ بالفشل بدون دليل تشويه معرفي. أنت تخلط بين الخوف والواقع.',
        color: '#b39ddb',
      },
    ],
  };

  const scenarios = SCENARIOS[lang] || SCENARIOS.fr;
  const current = scenarios[step];
  const isLast = step === scenarios.length - 1;

  const goNext = () => {
    if (isLast) { onClose(); return; }
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setStep(prev => prev + 1);
    setChoice(null);
  };

  return (
    <View style={rStyles.container}>
      <View style={rStyles.header}>
        <Text style={rStyles.title}>
          {lang === 'ar' ? 'إعادة صياغة الأفكار' : lang === 'en' ? 'Thought Reframing' : 'Recadrage TCC'}
        </Text>
        <TouchableOpacity onPress={onClose} style={rStyles.closeBtn}>
          <Feather name="x" size={20} color={COLORS.subtext} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
        {/* Thought */}
        <View style={[rStyles.thoughtBox, { borderLeftColor: current.color }]}>
          <Text style={[rStyles.thoughtText, isRTL && rStyles.rtl]}>{current.thought}</Text>
        </View>

        {/* Question */}
        <Text style={[rStyles.question, isRTL && rStyles.rtl]}>{current.question}</Text>

        {/* Options */}
        {current.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[rStyles.option, choice === i && { backgroundColor: current.color + '22', borderColor: current.color }]}
            onPress={() => setChoice(i)}
          >
            <View style={[rStyles.optDot, { backgroundColor: choice === i ? current.color : COLORS.border }]} />
            <Text style={[rStyles.optText, isRTL && rStyles.rtl, choice === i && { color: current.color, fontWeight: '700' }]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Reframe */}
        {choice !== null && (
          <View style={[rStyles.reframeBox, { backgroundColor: current.color + '15', borderColor: current.color }]}>
            <Feather name="zap" size={16} color={current.color} />
            <Text style={[rStyles.reframeText, isRTL && rStyles.rtl]}>{current.reframe}</Text>
          </View>
        )}
      </Animated.View>

      {choice !== null && (
        <TouchableOpacity style={[rStyles.nextBtn, { backgroundColor: current.color }]} onPress={goNext}>
          <Text style={rStyles.nextBtnText}>
            {isLast
              ? (lang === 'ar' ? 'انتهيت 💪' : lang === 'en' ? 'Done 💪' : 'Terminé 💪')
              : (lang === 'ar' ? 'التالي' : lang === 'en' ? 'Next' : 'Suivant')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const rStyles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.soft, justifyContent: 'center', alignItems: 'center' },
  thoughtBox: { backgroundColor: COLORS.soft, borderRadius: 14, padding: 16, borderLeftWidth: 4, marginBottom: 16 },
  thoughtText: { fontSize: 16, fontStyle: 'italic', color: COLORS.text, fontWeight: '600' },
  question: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, padding: 12, marginBottom: 8 },
  optDot: { width: 10, height: 10, borderRadius: 5 },
  optText: { fontSize: 14, color: COLORS.text, flex: 1 },
  reframeBox: { borderRadius: 14, borderWidth: 1.5, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 8, marginBottom: 16 },
  reframeText: { fontSize: 13, color: COLORS.text, lineHeight: 20, flex: 1 },
  nextBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  nextBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  rtl: { textAlign: 'right' },
});

// ─── MAIN ───
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
      'Prends 2 minutes pour t\'étirer 🧘',
      'Note une chose que tu as bien faite aujourd\'hui ⭐',
      'Appelle ou contacte un ami 📞',
      'Mange quelque chose de sain 🥗',
      'Écoute une musique qui te fait du bien 🎵',
      'Passe 10 min dehors au grand air 🌿',
      'Dis quelque chose de gentil à quelqu\'un 💛',
    ],
    en: [
      'Say thank you to someone today 🙏',
      'Write 3 positive things about your day ✍️',
      'Take a 5-minute phone break 📵',
      'Message someone you miss 💌',
      'Drink a big glass of water now 💧',
      'Take 10 slow deep breaths 🌬️',
      'Smile at a stranger today 😊',
      'Take 2 minutes to stretch 🧘',
      'Write down one thing you did well today ⭐',
      'Call or contact a friend 📞',
      'Eat something healthy 🥗',
      'Listen to music that makes you feel good 🎵',
      'Spend 10 minutes outside 🌿',
      'Say something kind to someone 💛',
    ],
    ar: [
      'قل شكراً لشخص ما اليوم 🙏',
      'اكتب 3 أشياء إيجابية عن يومك ✍️',
      'خذ استراحة 5 دقائق بدون هاتف 📵',
      'أرسل رسالة لشخص تشتاق إليه 💌',
      'اشرب كوباً كبيراً من الماء الآن 💧',
      'خذ 10 أنفاس عميقة ببطء 🌬️',
      'ابتسم لغريب اليوم 😊',
      'خذ دقيقتين للتمدد 🧘',
      'اكتب شيئاً أجدت فيه اليوم ⭐',
      'اتصل بصديق أو تواصل معه 📞',
      'تناول شيئاً صحياً 🥗',
      'استمع لموسيقى تشعرك بالتحسن 🎵',
      'اقضِ 10 دقائق في الهواء الطلق 🌿',
      'قل شيئاً لطيفاً لشخص ما 💛',
    ],
  };

  const getTodayChallenge = () => {
    const list = CHALLENGES[lang] || CHALLENGES.fr;
    const idx = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % list.length;
    return list[idx];
  };

  const TOOLS = [
    {
      id: 'breathing',
      icon: 'wind',
      color: '#7cb87a',
      title: { fr: 'Respiration 4-7-8', en: '4-7-8 Breathing', ar: 'تنفس 4-7-8' },
      desc: { fr: 'Calme le système nerveux en 2 min', en: 'Calms your nervous system in 2 min', ar: 'يهدئ الجهاز العصبي في دقيقتين' },
    },
    {
      id: 'grounding',
      icon: 'anchor',
      color: '#6bb5e6',
      title: { fr: 'Ancrage 5-4-3-2-1', en: '5-4-3-2-1 Grounding', ar: 'تأريض 5-4-3-2-1' },
      desc: { fr: 'Reviens au moment présent', en: 'Come back to the present moment', ar: 'عد إلى اللحظة الحاضرة' },
    },
    {
      id: 'reframing',
      icon: 'refresh-cw',
      color: '#e07a5f',
      title: { fr: 'Recadrage TCC', en: 'CBT Reframing', ar: 'إعادة صياغة TCC' },
      desc: { fr: 'Challenge tes pensées négatives', en: 'Challenge your negative thoughts', ar: 'تحدَّ أفكارك السلبية' },
    },
  ];

  if (activeScreen) {
    return (
      <SafeAreaView style={styles.container}>
        {activeScreen === 'breathing' && <BreathingExercise lang={lang} isRTL={isRTL} onClose={() => setActiveScreen(null)} />}
        {activeScreen === 'grounding' && <GroundingExercise lang={lang} isRTL={isRTL} onClose={() => setActiveScreen(null)} />}
        {activeScreen === 'reframing' && <ReframingExercise lang={lang} isRTL={isRTL} onClose={() => setActiveScreen(null)} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="wind" size={20} color={COLORS.accent} />
        </View>
        <Text style={styles.headerTitle}>{t.toolsTitle}</Text>
        <View style={{ width: 38 }} />
      </View>

      <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Daily Challenge */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeTop}>
            <Feather name="star" size={16} color={COLORS.white} />
            <Text style={styles.challengeTag}>
              {lang === 'ar' ? 'تحدي اليوم' : lang === 'en' ? 'Daily Challenge' : 'Défi du jour'}
            </Text>
          </View>
          <Text style={[styles.challengeText, isRTL && styles.rtl]}>{getTodayChallenge()}</Text>
          <TouchableOpacity
            style={[styles.challengeBtn, completedChallenge && styles.challengeBtnDone]}
            onPress={() => setCompletedChallenge(!completedChallenge)}
          >
            <Feather name={completedChallenge ? 'check-circle' : 'circle'} size={16} color={COLORS.white} />
            <Text style={styles.challengeBtnText}>
              {completedChallenge
                ? (lang === 'ar' ? 'أنجزته! 🎉' : lang === 'en' ? 'Done! 🎉' : 'Accompli ! 🎉')
                : (lang === 'ar' ? 'علّم كمنجز' : lang === 'en' ? 'Mark as done' : 'Marquer comme fait')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tools */}
        <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
          {lang === 'ar' ? 'تمارين تفاعلية' : lang === 'en' ? 'Interactive Exercises' : 'Exercices interactifs'}
        </Text>

        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={styles.toolCard}
            onPress={() => setActiveScreen(tool.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.toolIcon, { backgroundColor: tool.color + '22' }]}>
              <Feather name={tool.icon} size={24} color={tool.color} />
            </View>
            <View style={styles.toolInfo}>
              <Text style={[styles.toolTitle, isRTL && styles.rtl]}>{tool.title[lang]}</Text>
              <Text style={[styles.toolDesc, isRTL && styles.rtl]}>{tool.desc[lang]}</Text>
            </View>
            <View style={[styles.toolArrow, { backgroundColor: tool.color }]}>
              <Feather name="arrow-right" size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        ))}

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
  headerIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.soft, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  scroll: { padding: 20 },
  challengeCard: {
    backgroundColor: COLORS.warm, borderRadius: 24,
    padding: 20, marginBottom: 28,
    elevation: 4, shadowColor: COLORS.warm,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  challengeTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  challengeTag: { fontSize: 12, fontWeight: '700', color: COLORS.white, letterSpacing: 1 },
  challengeText: { fontSize: 16, color: COLORS.white, lineHeight: 26, marginBottom: 16, fontWeight: '500' },
  challengeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start',
  },
  challengeBtnDone: { backgroundColor: 'rgba(255,255,255,0.45)' },
  challengeBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  toolCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: 16, marginBottom: 12, gap: 14,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  toolIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  toolInfo: { flex: 1 },
  toolTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  toolDesc: { fontSize: 12, color: COLORS.subtext, lineHeight: 18 },
  toolArrow: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  rtl: { textAlign: 'right' },
});