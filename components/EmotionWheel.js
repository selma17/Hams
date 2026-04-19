import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, Animated, Dimensions
} from 'react-native';
import { useState, useRef } from 'react';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#fdfbf4',
  card: '#ffffff',
  text: '#3d3828',
  subtext: '#7a7455',
  muted: '#b8b49a',
  soft: '#f0ece0',
  white: '#ffffff',
  border: '#e2dcc8',
};

const EMOTIONS = {
  fr: [
    {
      core: 'Joie',
      color: '#f2c94c',
      icon: 'sun',
      desc: 'Tu ressens quelque chose de positif et d\'énergisant',
      subs: [
        { name: 'Heureux', tip: 'La joie simple du moment présent. Savoure-la pleinement.' },
        { name: 'Reconnaissant', tip: 'Reconnaître les bonnes choses renforce le bien-être. Écris-en 3 ce soir.' },
        { name: 'Excité', tip: 'Cette énergie est un carburant. Canalise-la vers ce qui compte.' },
        { name: 'Optimiste', tip: 'Voir le bon côté est une force. Continue à cultiver ça.' },
        { name: 'Fier', tip: 'Tu as accompli quelque chose. Reconnais ta propre valeur.' },
      ],
    },
    {
      core: 'Tristesse',
      color: '#6bb5e6',
      icon: 'cloud-rain',
      desc: 'Tu traverses une période difficile, et c\'est normal',
      subs: [
        { name: 'Seul·e', tip: 'La solitude fait mal. Parle à quelqu\'un aujourd\'hui, même 5 minutes.' },
        { name: 'Mélancolique', tip: 'Parfois on pense trop au passé. Concentre-toi sur un beau souvenir.' },
        { name: 'Abattu·e', tip: 'Ton énergie est basse. C\'est ok de se reposer et de prendre soin de toi.' },
        { name: 'Désespéré·e', tip: 'Ce sentiment est temporaire même s\'il semble permanent. Parle à quelqu\'un.' },
        { name: 'Vide', tip: 'Le vide peut signaler un besoin non satisfait. Qu\'est-ce qui te manque ?' },
      ],
    },
    {
      core: 'Peur',
      color: '#b39ddb',
      icon: 'alert-triangle',
      desc: 'Ton cerveau détecte une menace — réelle ou imaginaire',
      subs: [
        { name: 'Anxieux·se', tip: 'Respire : 4s inspire, 7s retiens, 8s expire. Répète 3 fois.' },
        { name: 'Inquiet·e', tip: 'Demande-toi : est-ce que je peux agir dessus ? Si oui, fais un pas. Sinon, lâche.' },
        { name: 'Paniqué·e', tip: 'Ancre-toi : nomme 5 choses que tu vois autour de toi maintenant.' },
        { name: 'Insécure', tip: 'Ce sentiment vient souvent de comparaisons. Tu es unique dans ta trajectoire.' },
        { name: 'Effrayé·e', tip: 'La peur est une information, pas une vérité. Qu\'est-ce qu\'elle essaie de te dire ?' },
      ],
    },
    {
      core: 'Colère',
      color: '#e07a5f',
      icon: 'zap',
      desc: 'Une limite a été franchie ou une injustice ressentie',
      subs: [
        { name: 'Frustré·e', tip: 'La frustration signale un besoin bloqué. Quel besoin n\'est pas satisfait ?' },
        { name: 'Irrité·e', tip: 'Prends 3 grandes respirations avant de réagir. Ça change tout.' },
        { name: 'Furieux·se', tip: 'Exprime la colère sans la diriger vers les autres : cours, écris, crie dans un coussin.' },
        { name: 'Blessé·e', tip: 'Derrière la colère se cache souvent de la tristesse. Qu\'est-ce qui t\'a blessé·e ?' },
        { name: 'Jaloux·se', tip: 'La jalousie révèle ce que tu veux profondément. Utilise-la comme boussole.' },
      ],
    },
    {
      core: 'Surprise',
      color: '#f2a65a',
      icon: 'star',
      desc: 'Quelque chose d\'inattendu a bousculé ta réalité',
      subs: [
        { name: 'Étonné·e', tip: 'La surprise t\'a tiré·e du pilote automatique. Reste curieux·se.' },
        { name: 'Confus·e', tip: 'La confusion précède souvent la compréhension. Prends le temps de réfléchir.' },
        { name: 'Bouleversé·e', tip: 'Quelque chose a changé. Donne-toi le droit de t\'adapter doucement.' },
        { name: 'Choqué·e', tip: 'Ton système a besoin de temps pour traiter. Prends soin de toi d\'abord.' },
        { name: 'Perdu·e', tip: 'Ne pas savoir où on en est, c\'est le début de quelque chose de nouveau.' },
      ],
    },
    {
      core: 'Calme',
      color: '#7cb87a',
      icon: 'wind',
      desc: 'Tu es dans un état d\'équilibre et de paix intérieure',
      subs: [
        { name: 'Serein·e', tip: 'Cet état est précieux. Note ce qui t\'y a mené pour pouvoir y revenir.' },
        { name: 'Apaisé·e', tip: 'La tempête est passée. Tu as traversé quelque chose de difficile.' },
        { name: 'Centré·e', tip: 'Tu es ancré·e dans le moment présent. C\'est rare et beau.' },
        { name: 'Content·e', tip: 'La satisfaction simple est sous-estimée. Apprécie ce moment.' },
        { name: 'En paix', tip: 'Tu es aligné·e avec toi-même. Garde cette fréquence.' },
      ],
    },
  ],
  en: [
    {
      core: 'Joy', color: '#f2c94c', icon: 'sun',
      desc: 'You\'re feeling something positive and energizing',
      subs: [
        { name: 'Happy', tip: 'Simple joy of the present moment. Savor it fully.' },
        { name: 'Grateful', tip: 'Recognizing good things builds wellbeing. Write 3 tonight.' },
        { name: 'Excited', tip: 'This energy is fuel. Channel it toward what matters.' },
        { name: 'Optimistic', tip: 'Seeing the bright side is a strength. Keep cultivating it.' },
        { name: 'Proud', tip: 'You accomplished something. Recognize your own worth.' },
      ],
    },
    {
      core: 'Sadness', color: '#6bb5e6', icon: 'cloud-rain',
      desc: 'You\'re going through a hard time, and that\'s okay',
      subs: [
        { name: 'Lonely', tip: 'Loneliness hurts. Talk to someone today, even 5 minutes.' },
        { name: 'Melancholic', tip: 'Sometimes we overthink the past. Focus on one good memory.' },
        { name: 'Down', tip: 'Your energy is low. It\'s okay to rest and take care of yourself.' },
        { name: 'Hopeless', tip: 'This feeling is temporary even if it seems permanent. Talk to someone.' },
        { name: 'Empty', tip: 'Emptiness can signal an unmet need. What\'s missing for you?' },
      ],
    },
    {
      core: 'Fear', color: '#b39ddb', icon: 'alert-triangle',
      desc: 'Your brain detects a threat — real or imagined',
      subs: [
        { name: 'Anxious', tip: 'Breathe: 4s inhale, 7s hold, 8s exhale. Repeat 3 times.' },
        { name: 'Worried', tip: 'Ask: can I act on this? If yes, take one step. If not, let go.' },
        { name: 'Panicked', tip: 'Ground yourself: name 5 things you can see around you right now.' },
        { name: 'Insecure', tip: 'This often comes from comparison. You\'re unique in your path.' },
        { name: 'Scared', tip: 'Fear is information, not truth. What is it trying to tell you?' },
      ],
    },
    {
      core: 'Anger', color: '#e07a5f', icon: 'zap',
      desc: 'A boundary was crossed or an injustice was felt',
      subs: [
        { name: 'Frustrated', tip: 'Frustration signals a blocked need. What need isn\'t being met?' },
        { name: 'Irritated', tip: 'Take 3 deep breaths before reacting. It changes everything.' },
        { name: 'Furious', tip: 'Express anger without directing it at others: run, write, scream into a pillow.' },
        { name: 'Hurt', tip: 'Behind anger often hides sadness. What hurt you?' },
        { name: 'Jealous', tip: 'Jealousy reveals what you deeply want. Use it as a compass.' },
      ],
    },
    {
      core: 'Surprise', color: '#f2a65a', icon: 'star',
      desc: 'Something unexpected disrupted your reality',
      subs: [
        { name: 'Amazed', tip: 'Surprise pulled you from autopilot. Stay curious.' },
        { name: 'Confused', tip: 'Confusion often precedes understanding. Take time to reflect.' },
        { name: 'Overwhelmed', tip: 'Something changed. Allow yourself to adapt slowly.' },
        { name: 'Shocked', tip: 'Your system needs time to process. Take care of yourself first.' },
        { name: 'Lost', tip: 'Not knowing where you are is the beginning of something new.' },
      ],
    },
    {
      core: 'Calm', color: '#7cb87a', icon: 'wind',
      desc: 'You\'re in a state of balance and inner peace',
      subs: [
        { name: 'Serene', tip: 'This state is precious. Note what led you here to return to it.' },
        { name: 'At peace', tip: 'The storm has passed. You\'ve been through something difficult.' },
        { name: 'Centered', tip: 'You\'re anchored in the present moment. That\'s rare and beautiful.' },
        { name: 'Content', tip: 'Simple satisfaction is underrated. Appreciate this moment.' },
        { name: 'Balanced', tip: 'You\'re aligned with yourself. Keep this frequency.' },
      ],
    },
  ],
  ar: [
    {
      core: 'فرح', color: '#f2c94c', icon: 'sun',
      desc: 'تشعر بشيء إيجابي ومنشط',
      subs: [
        { name: 'سعيد', tip: 'بهجة اللحظة الحاضرة. استمتع بها بالكامل.' },
        { name: 'ممتن', tip: 'الاعتراف بالأشياء الجيدة يعزز السعادة. اكتب 3 منها الليلة.' },
        { name: 'متحمس', tip: 'هذه الطاقة وقود. وجّهها نحو ما يهمك.' },
        { name: 'متفائل', tip: 'رؤية الجانب المشرق قوة. استمر في تنميتها.' },
        { name: 'فخور', tip: 'أنجزت شيئاً. اعترف بقيمتك الخاصة.' },
      ],
    },
    {
      core: 'حزن', color: '#6bb5e6', icon: 'cloud-rain',
      desc: 'تمر بوقت صعب، وهذا طبيعي',
      subs: [
        { name: 'وحيد', tip: 'الوحدة مؤلمة. تحدث مع شخص ما اليوم، ولو 5 دقائق.' },
        { name: 'كئيب', tip: 'أحياناً نفكر كثيراً في الماضي. ركّز على ذكرى جميلة.' },
        { name: 'محبط', tip: 'طاقتك منخفضة. من المقبول الراحة والاعتناء بنفسك.' },
        { name: 'يائس', tip: 'هذا الشعور مؤقت حتى لو بدا دائماً. تحدث مع شخص.' },
        { name: 'فارغ', tip: 'الفراغ يمكن أن يشير إلى حاجة غير مُلباة. ماذا يعوزك؟' },
      ],
    },
    {
      core: 'خوف', color: '#b39ddb', icon: 'alert-triangle',
      desc: 'دماغك يكتشف تهديداً — حقيقياً أو متخيلاً',
      subs: [
        { name: 'قلق', tip: 'تنفّس: 4 ثوانٍ شهيق، 7 ثوانٍ حبس، 8 ثوانٍ زفير. كرر 3 مرات.' },
        { name: 'مشغول', tip: 'اسأل: هل يمكنني التصرف؟ إذا نعم، خطوة واحدة. إذا لا، تخلَّ عنه.' },
        { name: 'مذعور', tip: 'ارسِّخ نفسك: سمِّ 5 أشياء تراها حولك الآن.' },
        { name: 'غير آمن', tip: 'غالباً يأتي من المقارنة. أنت فريد في مسيرتك.' },
        { name: 'خائف', tip: 'الخوف معلومة وليس حقيقة. ماذا يحاول أن يخبرك؟' },
      ],
    },
    {
      core: 'غضب', color: '#e07a5f', icon: 'zap',
      desc: 'تم تجاوز حد أو الشعور بظلم',
      subs: [
        { name: 'محبط', tip: 'الإحباط يشير إلى حاجة محجوبة. أي حاجة غير مُلباة؟' },
        { name: 'متهيج', tip: 'خذ 3 أنفاس عميقة قبل الرد. يغير كل شيء.' },
        { name: 'غاضب', tip: 'عبّر عن الغضب دون توجيهه للآخرين: اجرِ، اكتب، اصرخ في وسادة.' },
        { name: 'مجروح', tip: 'خلف الغضب يختبئ الحزن غالباً. ما الذي آلمك؟' },
        { name: 'غيور', tip: 'الغيرة تكشف ما تريده بعمق. استخدمها كبوصلة.' },
      ],
    },
    {
      core: 'مفاجأة', color: '#f2a65a', icon: 'star',
      desc: 'شيء غير متوقع أربك واقعك',
      subs: [
        { name: 'مندهش', tip: 'المفاجأة أخرجتك من الطيار الآلي. ابقَ فضولياً.' },
        { name: 'مرتبك', tip: 'الارتباك يسبق الفهم غالباً. خذ وقتك للتفكير.' },
        { name: 'مرهق', tip: 'شيء تغيّر. امنح نفسك حق التكيّف ببطء.' },
        { name: 'مصدوم', tip: 'نظامك يحتاج وقتاً للمعالجة. اعتنِ بنفسك أولاً.' },
        { name: 'ضائع', tip: 'عدم معرفة أين أنت هو بداية شيء جديد.' },
      ],
    },
    {
      core: 'هدوء', color: '#7cb87a', icon: 'wind',
      desc: 'أنت في حالة توازن وسلام داخلي',
      subs: [
        { name: 'مرتاح', tip: 'هذه الحالة ثمينة. لاحظ ما أوصلك إليها لتعود إليها.' },
        { name: 'هادئ', tip: 'العاصفة مرّت. لقد اجتزت شيئاً صعباً.' },
        { name: 'متمركز', tip: 'أنت راسخ في اللحظة الحاضرة. هذا نادر وجميل.' },
        { name: 'راضٍ', tip: 'الرضا البسيط مُقلَّل من قيمته. قدّر هذه اللحظة.' },
        { name: 'في سلام', tip: 'أنت منسجم مع نفسك. حافظ على هذا التردد.' },
      ],
    },
  ],
};

export default function EmotionWheel({ lang = 'fr', isRTL = false }) {
  const [selected, setSelected] = useState(null);
  const [subSelected, setSubSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const emotions = EMOTIONS[lang] || EMOTIONS.fr;

  const handleCore = (emotion) => {
    setSelected(emotion);
    setSubSelected(null);
    setShowModal(true);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100 }).start();
  };

  const handleClose = () => {
    setShowModal(false);
    setSubSelected(null);
    scaleAnim.setValue(0.8);
  };

  return (
    <View>
      {/* Hexagonal-style grid */}
      <View style={styles.grid}>
        {emotions.map((emotion, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.emotionCard, { borderColor: emotion.color, backgroundColor: emotion.color + '18' }]}
            onPress={() => handleCore(emotion)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: emotion.color + '30' }]}>
              <Feather name={emotion.icon} size={20} color={emotion.color} />
            </View>
            <Text style={[styles.emotionLabel, { color: emotion.color }]}>{emotion.core}</Text>
            <Text style={styles.emotionHint} numberOfLines={1}>
              {emotion.subs.length} nuances
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>

            {/* Header */}
            <View style={[styles.modalTop, { backgroundColor: selected?.color + '20' }]}>
              <View style={[styles.modalIconBig, { backgroundColor: selected?.color }]}>
                <Feather name={selected?.icon || 'heart'} size={28} color={COLORS.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: selected?.color }]}>{selected?.core}</Text>
                <Text style={[styles.modalDesc, isRTL && styles.rtl]}>{selected?.desc}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Feather name="x" size={18} color={COLORS.subtext} />
              </TouchableOpacity>
            </View>

            {/* Question */}
            <Text style={[styles.questionText, isRTL && styles.rtl]}>
              {lang === 'ar' ? '🔍 أيها يصفك أكثر؟'
                : lang === 'en' ? '🔍 Which one fits best?'
                : '🔍 Laquelle te correspond le mieux ?'}
            </Text>

            {/* Sub-emotions */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
              {selected?.subs.map((sub, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.subItem,
                    subSelected?.name === sub.name && {
                      backgroundColor: selected?.color + '20',
                      borderColor: selected?.color,
                    }
                  ]}
                  onPress={() => setSubSelected(sub)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.subDot,
                    { backgroundColor: subSelected?.name === sub.name ? selected?.color : COLORS.border }
                  ]} />
                  <Text style={[
                    styles.subName,
                    isRTL && styles.rtl,
                    subSelected?.name === sub.name && { color: selected?.color, fontWeight: '700' }
                  ]}>
                    {sub.name}
                  </Text>
                  {subSelected?.name === sub.name && (
                    <Feather name="check" size={14} color={selected?.color} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tip box — apparaît quand on sélectionne */}
            {subSelected && (
              <Animated.View style={[styles.tipBox, { borderLeftColor: selected?.color }]}>
                <View style={styles.tipHeader}>
                  <Feather name="lightbulb" size={14} color={selected?.color} />
                  <Text style={[styles.tipLabel, { color: selected?.color }]}>
                    {lang === 'ar' ? 'نصيحة لك' : lang === 'en' ? 'Tip for you' : 'Conseil pour toi'}
                  </Text>
                </View>
                <Text style={[styles.tipText, isRTL && styles.rtl]}>{subSelected.tip}</Text>
              </Animated.View>
            )}

            {/* Close button */}
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: selected?.color }]}
              onPress={handleClose}
            >
              <Text style={styles.doneBtnText}>
                {lang === 'ar' ? 'شكراً، فهمت' : lang === 'en' ? 'Got it, thanks' : 'Compris, merci 🤍'}
              </Text>
            </TouchableOpacity>

          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emotionCard: {
    width: (width - 48 - 10) / 2,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'flex-start',
    gap: 8,
  },
  iconCircle: {
    width: 40, height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emotionLabel: {
    fontSize: 15, fontWeight: '800',
  },
  emotionHint: {
    fontSize: 11, color: COLORS.muted,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    width: '100%',
    maxWidth: 420,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  modalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    paddingBottom: 16,
  },
  modalIconBig: {
    width: 54, height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22, fontWeight: '800',
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 12,
    color: COLORS.subtext,
    lineHeight: 18,
  },
  closeBtn: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.soft,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  questionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subtext,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.soft,
  },
  subDot: {
    width: 10, height: 10,
    borderRadius: 5,
  },
  subName: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },

  tipBox: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.soft,
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    gap: 6,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },

  doneBtn: {
    margin: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  rtl: { textAlign: 'right' },
});