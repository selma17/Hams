import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  FlatList, TextInput, KeyboardAvoidingView, Platform,
  Animated, Alert
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../context/LangContext';
import { AVATARS } from '../constants/avatars';
import { sendMessage } from '../services/groq';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

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

function TypingIndicator({ color }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={typingStyles.container}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[typingStyles.dot, { backgroundColor: color, transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

const typingStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 12 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});

export default function Chat() {
  const { avatarId } = useLocalSearchParams();
  const router = useRouter();
  const { t, isRTL, lang } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [avatarName, setAvatarName] = useState('');
  const flatListRef = useRef(null);

  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  const STORAGE_KEY = `chat_history_${avatarId}`;

  useEffect(() => {
    const load = async () => {
      const names = await AsyncStorage.getItem('avatarNames');
      const userName = await AsyncStorage.getItem('userName');
      const savedHistory = await AsyncStorage.getItem(STORAGE_KEY);

      let name = avatar.defaultName;
      if (names) {
        const parsed = JSON.parse(names);
        name = parsed[avatarId] || avatar.defaultName;
        setAvatarName(name);
      }

      // Load saved history or show welcome message
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      } else {
        const welcomes = {
          fr: {
            jule: `Yoo ${userName || ''} ! C'est moi 😎 Qu'est-ce qui se passe ?`,
            leo: `Bonjour ${userName || ''} 🌿 Je suis là. Prends ton temps.`,
            nyx: `Hey ${userName || ''} ! 🔥 Prêt·e à tout déchirer aujourd'hui ?`,
            sage: `${userName || ''}. Je t'écoute. Une pensée à la fois.`,
            echo: `Bonjour ${userName || ''}. Je suis là pour t'aider à t'entendre.`,
          },
          en: {
            jule: `Yoo ${userName || ''} ! It's me 😎 What's going on?`,
            leo: `Hello ${userName || ''} 🌿 I'm here. Take your time.`,
            nyx: `Hey ${userName || ''} ! 🔥 Ready to crush it today?`,
            sage: `${userName || ''}. I'm listening. One thought at a time.`,
            echo: `Hello ${userName || ''}. I'm here to help you hear yourself.`,
          },
          ar: {
            jule: `هيا ${userName || ''} ! أنا هنا 😎 ماذا يحدث؟`,
            leo: `مرحباً ${userName || ''} 🌿 أنا هنا. خذ وقتك.`,
            nyx: `هيا ${userName || ''} ! 🔥 مستعد اليوم؟`,
            sage: `${userName || ''}. أنا أستمع. فكرة واحدة في كل مرة.`,
            echo: `مرحباً ${userName || ''}. أنا هنا لمساعدتك على سماع نفسك.`,
          },
        };
        const welcomeText = welcomes[lang]?.[avatarId] || welcomes.fr[avatarId];
        const welcome = [{ id: '0', role: 'assistant', text: welcomeText }];
        setMessages(welcome);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(welcome));
      }
    };
    load();
  }, [avatarId, lang]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user', text: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    // Save immediately
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));

    try {
      const history = newMessages.map(m => ({ role: m.role, content: m.text }));
      const reply = await sendMessage(avatar.systemPrompt, history);
      const botMsg = { id: (Date.now() + 1).toString(), role: 'assistant', text: reply };
      const updated = [...newMessages, botMsg];
      setMessages(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: lang === 'ar' ? 'عذراً، حدث خطأ.' : lang === 'en' ? 'Sorry, something went wrong.' : 'Désolé, une erreur s\'est produite.',
      };
      const updated = [...newMessages, errMsg];
      setMessages(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      lang === 'ar' ? 'مسح المحادثة' : lang === 'en' ? 'Clear conversation' : 'Effacer la conversation',
      lang === 'ar' ? 'هل أنت متأكد؟' : lang === 'en' ? 'Are you sure?' : 'Tu es sûr·e ?',
      [
        { text: lang === 'ar' ? 'إلغاء' : lang === 'en' ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: lang === 'ar' ? 'مسح' : lang === 'en' ? 'Clear' : 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            const welcome = [{ id: '0', role: 'assistant', text: messages[0]?.text || '' }];
            setMessages(welcome);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(welcome));
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
        {!isUser && (
          <View style={[styles.avatarDot, { backgroundColor: avatar.color + '33' }]}>
            <AvatarIcon avatarId={avatarId} size={14} color={avatar.color} />
          </View>
        )}
        <View style={[
          styles.bubble,
          isUser ? [styles.userBubble, { backgroundColor: avatar.color }] : styles.botBubble,
        ]}>
          <Text style={[
            styles.bubbleText,
            isUser ? styles.userBubbleText : styles.botBubbleText,
            isRTL && styles.rtl,
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: avatar.color + '25' }]}>
            <AvatarIcon avatarId={avatarId} size={20} color={avatar.color} />
          </View>
          <View>
            <Text style={styles.headerName}>{avatarName || avatar.defaultName}</Text>
            <Text style={styles.headerStatus}>
              {lang === 'ar' ? '● متصل' : lang === 'en' ? '● Online' : '● En ligne'}
            </Text>
          </View>
        </View>

        {/* Clear button */}
        <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
          <Feather name="trash-2" size={18} color={COLORS.subtext} />
        </TouchableOpacity>
      </View>

      {/* ── MESSAGES ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? (
            <View style={styles.msgRowBot}>
              <View style={[styles.avatarDot, { backgroundColor: avatar.color + '33' }]}>
                <AvatarIcon avatarId={avatarId} size={14} color={avatar.color} />
              </View>
              <View style={styles.botBubble}>
                <TypingIndicator color={avatar.color} />
              </View>
            </View>
          ) : null}
        />

        {/* ── INPUT ── */}
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, isRTL && styles.rtl]}
            value={input}
            onChangeText={setInput}
            placeholder={t.typeMessage}
            placeholderTextColor={COLORS.muted}
            multiline
            maxLength={500}
            textAlign={isRTL ? 'right' : 'left'}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() ? avatar.color : COLORS.muted }]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Feather name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    elevation: 2,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.soft,
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  headerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  headerStatus: { fontSize: 11, color: '#7bc67e', fontWeight: '600', marginTop: 1 },
  clearBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.soft,
    justifyContent: 'center', alignItems: 'center',
  },

  messagesList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowBot: { justifyContent: 'flex-start' },
  avatarDot: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  bubble: { maxWidth: '75%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { borderBottomRightRadius: 4, elevation: 2 },
  botBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4, elevation: 1,
    borderWidth: 1, borderColor: COLORS.border,
  },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  userBubbleText: { color: COLORS.white },
  botBubbleText: { color: COLORS.text },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10,
  },
  input: {
    flex: 1, backgroundColor: COLORS.soft,
    borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14,
    color: COLORS.text, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', elevation: 3,
  },
  rtl: { textAlign: 'right' },
});