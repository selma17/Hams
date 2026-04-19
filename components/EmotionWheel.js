import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  bg: '#fefae0',
  card: '#faedcd',
  accent: '#d4a373',
  text: '#5c4a2a',
  subtext: '#8a7560',
  white: '#ffffff',
  muted: '#ccd5ae',
};

const EMOTIONS = {
  fr: [
    { core: 'Joie', color: '#FFD93D', subs: ['Heureux', 'Reconnaissant', 'Excité', 'Optimiste', 'Fier'] },
    { core: 'Tristesse', color: '#6BB5FF', subs: ['Seul', 'Mélancolique', 'Abattu', 'Désespéré', 'Vide'] },
    { core: 'Peur', color: '#B5A7FF', subs: ['Anxieux', 'Inquiet', 'Paniqué', 'Insécure', 'Effrayé'] },
    { core: 'Colère', color: '#FF6B6B', subs: ['Frustré', 'Irrité', 'Furieux', 'Blessé', 'Jaloux'] },
    { core: 'Surprise', color: '#FF9A3C', subs: ['Étonné', 'Confus', 'Bouleversé', 'Choqué', 'Perdu'] },
    { core: 'Calme', color: '#6BCB77', subs: ['Serein', 'Apaisé', 'Centré', 'Content', 'En paix'] },
  ],
  en: [
    { core: 'Joy', color: '#FFD93D', subs: ['Happy', 'Grateful', 'Excited', 'Optimistic', 'Proud'] },
    { core: 'Sadness', color: '#6BB5FF', subs: ['Lonely', 'Melancholic', 'Dejected', 'Hopeless', 'Empty'] },
    { core: 'Fear', color: '#B5A7FF', subs: ['Anxious', 'Worried', 'Panicked', 'Insecure', 'Scared'] },
    { core: 'Anger', color: '#FF6B6B', subs: ['Frustrated', 'Irritated', 'Furious', 'Hurt', 'Jealous'] },
    { core: 'Surprise', color: '#FF9A3C', subs: ['Amazed', 'Confused', 'Overwhelmed', 'Shocked', 'Lost'] },
    { core: 'Calm', color: '#6BCB77', subs: ['Serene', 'Peaceful', 'Centered', 'Content', 'At ease'] },
  ],
  ar: [
    { core: 'فرح', color: '#FFD93D', subs: ['سعيد', 'ممتن', 'متحمس', 'متفائل', 'فخور'] },
    { core: 'حزن', color: '#6BB5FF', subs: ['وحيد', 'كئيب', 'محبط', 'يائس', 'فارغ'] },
    { core: 'خوف', color: '#B5A7FF', subs: ['قلق', 'مشغول', 'مذعور', 'غير آمن', 'خائف'] },
    { core: 'غضب', color: '#FF6B6B', subs: ['محبط', 'متهيج', 'غاضب', 'مجروح', 'غيور'] },
    { core: 'مفاجأة', color: '#FF9A3C', subs: ['مندهش', 'مرتبك', 'مرهق', 'مصدوم', 'ضائع'] },
    { core: 'هدوء', color: '#6BCB77', subs: ['مرتاح', 'هادئ', 'متمركز', 'راضٍ', 'في سلام'] },
  ],
};

export default function EmotionWheel({ lang = 'fr', isRTL = false }) {
  const [selected, setSelected] = useState(null);
  const [subSelected, setSubSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const emotions = EMOTIONS[lang] || EMOTIONS.fr;

  const handleCore = (emotion) => {
    setSelected(emotion);
    setSubSelected(null);
    setShowModal(true);
  };

  return (
    <View>
      {/* Core emotions grid */}
      <View style={styles.grid}>
        {emotions.map((emotion, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.coreBtn, { backgroundColor: emotion.color + '33', borderColor: emotion.color }]}
            onPress={() => handleCore(emotion)}
            activeOpacity={0.8}
          >
            <View style={[styles.coreDot, { backgroundColor: emotion.color }]} />
            <Text style={[styles.coreLabel, isRTL && styles.rtl]}>{emotion.core}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sub-emotions modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalHeader, isRTL && styles.rowReverse]}>
              <View style={[styles.modalDot, { backgroundColor: selected?.color }]} />
              <Text style={styles.modalTitle}>{selected?.core}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={20} color={COLORS.subtext} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, isRTL && styles.rtl]}>
              {lang === 'ar' ? 'أي منها يصف ما تشعر به بالضبط؟'
                : lang === 'en' ? 'Which one describes exactly how you feel?'
                : 'Laquelle décrit exactement ce que tu ressens ?'}
            </Text>

            <View style={styles.subGrid}>
              {selected?.subs.map((sub, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.subBtn,
                    { borderColor: selected?.color },
                    subSelected === sub && { backgroundColor: selected?.color + '33' }
                  ]}
                  onPress={() => setSubSelected(sub)}
                >
                  <Text style={[styles.subLabel, subSelected === sub && { color: selected?.color, fontWeight: '700' }]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {subSelected && (
              <View style={[styles.resultBox, { backgroundColor: selected?.color + '22' }]}>
                <Text style={[styles.resultText, isRTL && styles.rtl]}>
                  {lang === 'ar' ? `أنت تشعر بـ "${subSelected}" — هذا مهم أن تعرفه 🤍`
                    : lang === 'en' ? `You feel "${subSelected}" — it's important to know that 🤍`
                    : `Tu te sens "${subSelected}" — c'est important de le nommer 🤍`}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: selected?.color }]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeBtnText}>
                {lang === 'ar' ? 'حسناً' : lang === 'en' ? 'Got it' : 'Compris'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  coreBtn: {
    width: '47%', borderRadius: 16,
    borderWidth: 1.5, paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  coreDot: { width: 10, height: 10, borderRadius: 5 },
  coreLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 12,
    justifyContent: 'space-between',
  },
  rowReverse: { flexDirection: 'row-reverse' },
  modalDot: { width: 14, height: 14, borderRadius: 7 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, flex: 1 },
  modalSub: { fontSize: 13, color: COLORS.subtext, marginBottom: 16, fontStyle: 'italic' },
  subGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  subBtn: {
    borderWidth: 1.5, borderRadius: 12,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  subLabel: { fontSize: 13, color: COLORS.text },
  resultBox: {
    borderRadius: 14, padding: 14, marginBottom: 16,
  },
  resultText: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  closeBtn: {
    borderRadius: 16, paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  rtl: { textAlign: 'right' },
});