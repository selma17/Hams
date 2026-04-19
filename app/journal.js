import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../context/LangContext';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const MOOD_OPTIONS = [
  { icon: 'frown', label: { fr: 'Triste', en: 'Sad', ar: 'حزين' }, color: '#a8c5da', value: 1 },
  { icon: 'meh', label: { fr: 'Neutre', en: 'Neutral', ar: 'محايد' }, color: '#ccd5ae', value: 2 },
  { icon: 'smile', label: { fr: 'Bien', en: 'Good', ar: 'بخير' }, color: '#d4a373', value: 3 },
  { icon: 'sun', label: { fr: 'Super', en: 'Great', ar: 'رائع' }, color: '#e9a87c', value: 4 },
];

export default function Journal() {
  const { t, isRTL, lang } = useLang();
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [view, setView] = useState('write'); // 'write' | 'history'
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadEntries();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const loadEntries = async () => {
    const stored = await AsyncStorage.getItem('journalEntries');
    if (stored) setEntries(JSON.parse(stored));
  };

  const saveEntry = async () => {
    if (!text.trim()) return;
    const entry = {
      id: Date.now().toString(),
      text: text.trim(),
      mood: selectedMood,
      date: new Date().toISOString(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    await AsyncStorage.setItem('journalEntries', JSON.stringify(updated));
    setText('');
    setSelectedMood(null);
    setView('history');
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(
      lang === 'ar' ? 'ar-TN' : lang === 'en' ? 'en-US' : 'fr-FR',
      { weekday: 'short', day: 'numeric', month: 'long' }
    );
  };

  const getMoodForEntry = (mood) => {
    return MOOD_OPTIONS.find(m => m.value === mood?.value);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="book" size={20} color={COLORS.accent} />
        </View>
        <Text style={styles.headerTitle}>{t.journalTitle}</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, view === 'write' && styles.tabActive]}
            onPress={() => setView('write')}
          >
            <Feather name="edit-3" size={16} color={view === 'write' ? COLORS.white : COLORS.subtext} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, view === 'history' && styles.tabActive]}
            onPress={() => setView('history')}
          >
            <Feather name="clock" size={16} color={view === 'history' ? COLORS.white : COLORS.subtext} />
          </TouchableOpacity>
        </View>
      </View>

      {view === 'write' ? (
        // ── WRITE VIEW ──
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={90}
        >
          <ScrollView contentContainerStyle={styles.writeContainer} showsVerticalScrollIndicator={false}>

            {/* Date */}
            <Text style={[styles.dateText, isRTL && styles.rtl]}>
              {new Date().toLocaleDateString(
                lang === 'ar' ? 'ar-TN' : lang === 'en' ? 'en-US' : 'fr-FR',
                { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
              )}
            </Text>

            {/* Mood selector */}
            <Text style={[styles.sectionLabel, isRTL && styles.rtl]}>
              {lang === 'ar' ? 'كيف تشعر؟' : lang === 'en' ? 'How do you feel?' : 'Comment tu te sens ?'}
            </Text>
            <View style={styles.moodRow}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodBtn,
                    selectedMood?.value === mood.value && {
                      backgroundColor: mood.color + '33',
                      borderColor: mood.color,
                    }
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Feather
                    name={mood.icon}
                    size={26}
                    color={selectedMood?.value === mood.value ? mood.color : COLORS.subtext}
                  />
                  <Text style={[
                    styles.moodLabel,
                    selectedMood?.value === mood.value && { color: mood.color, fontWeight: '700' }
                  ]}>
                    {mood.label[lang]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Text input */}
            <Text style={[styles.sectionLabel, isRTL && styles.rtl]}>
              {lang === 'ar' ? 'أفكارك...' : lang === 'en' ? 'Your thoughts...' : 'Tes pensées...'}
            </Text>
            <View style={styles.textBox}>
              <TextInput
                style={[styles.textInput, isRTL && styles.rtl]}
                value={text}
                onChangeText={setText}
                placeholder={t.journalPlaceholder}
                placeholderTextColor={COLORS.muted}
                multiline
                textAlignVertical="top"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, !text.trim() && styles.saveBtnDisabled]}
              onPress={saveEntry}
              disabled={!text.trim()}
            >
              <Feather name="check" size={18} color={COLORS.white} />
              <Text style={styles.saveBtnText}>{t.save}</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>

      ) : (
        // ── HISTORY VIEW ──
        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          contentContainerStyle={styles.historyContainer}
          showsVerticalScrollIndicator={false}
        >
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="book-open" size={48} color={COLORS.muted} />
              <Text style={[styles.emptyText, isRTL && styles.rtl]}>
                {lang === 'ar' ? 'لا توجد مدخلات بعد' : lang === 'en' ? 'No entries yet' : 'Pas encore d\'entrées'}
              </Text>
              <TouchableOpacity onPress={() => setView('write')} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>
                  {lang === 'ar' ? 'ابدأ الكتابة' : lang === 'en' ? 'Start writing' : 'Commencer à écrire'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            entries.map((entry) => {
              const mood = getMoodForEntry(entry.mood);
              return (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={[styles.entryHeader, isRTL && styles.rowReverse]}>
                    <Text style={[styles.entryDate, isRTL && styles.rtl]}>
                      {formatDate(entry.date)}
                    </Text>
                    {mood && (
                      <View style={[styles.moodBadge, { backgroundColor: mood.color + '33' }]}>
                        <Feather name={mood.icon} size={14} color={mood.color} />
                        <Text style={[styles.moodBadgeText, { color: mood.color }]}>
                          {mood.label[lang]}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.entryText, isRTL && styles.rtl]} numberOfLines={4}>
                    {entry.text}
                  </Text>
                </View>
              );
            })
          )}
        </Animated.ScrollView>
      )}
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
  headerTitle: {
    fontSize: 18, fontWeight: '800', color: COLORS.text,
  },
  tabs: { flexDirection: 'row', gap: 6 },
  tab: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.soft,
    justifyContent: 'center', alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent },

  // Write
  writeContainer: { padding: 20, paddingBottom: 40 },
  dateText: {
    fontSize: 14, color: COLORS.subtext,
    marginBottom: 20, fontStyle: 'italic',
  },
  sectionLabel: {
    fontSize: 14, fontWeight: '700',
    color: COLORS.text, marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row', gap: 10,
    marginBottom: 24,
  },
  moodBtn: {
    flex: 1, alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14, paddingVertical: 12,
    borderWidth: 2, borderColor: 'transparent',
  },
  moodLabel: {
    fontSize: 10, color: COLORS.subtext,
    marginTop: 4, textAlign: 'center',
  },
  textBox: {
    backgroundColor: COLORS.card,
    borderRadius: 20, padding: 16,
    marginBottom: 20, minHeight: 200,
  },
  textInput: {
    fontSize: 15, color: COLORS.text,
    lineHeight: 24, minHeight: 180,
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 16, paddingVertical: 16,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8,
    elevation: 3,
  },
  saveBtnDisabled: { backgroundColor: COLORS.muted, elevation: 0 },
  saveBtnText: {
    color: COLORS.white, fontSize: 16, fontWeight: '700',
  },

  // History
  historyContainer: { padding: 20, paddingBottom: 40 },
  entryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20, padding: 16,
    marginBottom: 14, elevation: 2,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6,
  },
  entryHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  entryDate: { fontSize: 12, color: COLORS.subtext, fontStyle: 'italic' },
  moodBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, gap: 4,
  },
  moodBadgeText: { fontSize: 11, fontWeight: '700' },
  entryText: { fontSize: 14, color: COLORS.text, lineHeight: 22 },

  // Empty
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, gap: 16,
  },
  emptyText: { fontSize: 15, color: COLORS.subtext },
  emptyBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: '700' },

  rtl: { textAlign: 'right' },
});