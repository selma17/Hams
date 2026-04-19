import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  FlatList, TextInput, KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../context/LangContext';
import { AVATARS } from '../constants/avatars';
import { sendMessage } from '../services/groq';
import { Feather, Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#fefae0',
  card: '#faedcd',
  accent: '#d4a373',
  soft: '#e9edc9',
  muted: '#ccd5ae',
  text: '#5c4a2a',
  subtext: '#8a7560',
  white: '#ffffff',
  userBubble: '#d4a373',
  botBubble: '#faedcd',
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

  useEffect(() => {
    const load = async () => {
      const names = await AsyncStorage.getItem('avatarNames');
      const userName = await AsyncStorage.getItem('userName');
      if (names) {
        const parsed = JSON.parse(names);
        setAvatarName(parsed[avatarId] || avatar.defaultName);
      }

      // Welcome message
      const welcomes = {
        fr: {
          jule: `Yoo ${userName || ''} ! C'est moi, ${avatarName || avatar.defaultName} 😎 Qu'est-ce qui se passe ?`,
          leo: `Bonjour ${userName || ''} 🌿 Je suis là. Prends ton temps, dis-moi ce que tu ressens.`,
          nyx: `Hey ${userName || ''} ! 🔥 Prêt·e à tout déchirer aujourd'hui ? Dis-moi tout !`,
          sage: `${userName || ''}. Je t'écoute. Une pensée à la fois.`,
          echo: `Bonjour ${userName || ''}. Je suis là pour t'aider à t'entendre toi-même.`,
        },
        en: {
          jule: `Yoo ${userName || ''} ! It's me 😎 What's going on?`,
          leo: `Hello ${userName || ''} 🌿 I'm here. Take your time, tell me how you feel.`,
          nyx: `Hey ${userName || ''} ! 🔥 Ready to crush it today? Tell me everything!`,
          sage: `${userName || ''}. I'm listening. One thought at a time.`,
          echo: `Hello ${userName || ''}. I'm here to help you hear yourself.`,
        },
        ar: {
          jule: `هيا ${userName || ''} ! أنا هنا 😎 ماذا يحدث؟`,
          leo: `مرحباً ${userName || ''} 🌿 أنا هنا. خذ وقتك، أخبرني كيف تشعر.`,
          nyx: `هيا ${userName || ''} ! 🔥 مستعد اليوم؟ أخبرني كل شيء!`,
          sage: `${userName || ''}. أنا أستمع. فكرة واحدة في كل مرة.`,
          echo: `مرحباً ${userName || ''}. أنا هنا لمساعدتك على سماع نفسك.`,
        },
      };

      const welcomeText = welcomes[lang]?.[avatarId] || welcomes.fr[avatarId];
      setMessages([{ id: '0', role: 'assistant', text: welcomeText }]);
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

    try {
      const history = newMessages.map(m => ({
        role: m.role,
        content: m.text,
      }));
      const reply = await sendMessage(avatar.systemPrompt, history);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: reply,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: lang === 'ar' ? 'عذراً، حدث خطأ. حاول مجدداً.' : lang === 'en' ? 'Sorry, something went wrong.' : 'Désolé, une erreur s\'est produite.',
      }]);
    } finally {
      setIsTyping(false);
    }
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
          isRTL && { alignItems: 'flex-end' }
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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
        <View style={{ width: 36 }} />
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
            placeholderTextColor={COLORS.subtext}
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

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.muted,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
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

  // Messages
  messagesList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowBot: { justifyContent: 'flex-start' },
  avatarDot: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
  },
  bubble: {
    maxWidth: '75%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    elevation: 2,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.botBubble,
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  userBubbleText: { color: COLORS.white },
  botBubbleText: { color: COLORS.text },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.muted,
    gap: 10,
  },
  input: {
    flex: 1, backgroundColor: COLORS.soft,
    borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14,
    color: COLORS.text, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    elevation: 3,
  },

  rtl: { textAlign: 'right' },
});