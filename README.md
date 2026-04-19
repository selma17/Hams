# هَمْس — Hams

<div align="center">

**L'espace safe pour la santé mentale des adolescents**

*Écouter · Comprendre · Accompagner*

![React Native](https://img.shields.io/badge/React_Native-Expo-black?style=flat-square&logo=expo)
![AI](https://img.shields.io/badge/IA-LLaMA_3.3_70B-orange?style=flat-square)
![Groq](https://img.shields.io/badge/API-Groq-purple?style=flat-square)
![License](https://img.shields.io/badge/Hackathon-ARSII_2025-olive?style=flat-square)

</div>

---

## 📖 À propos

**Hams (هَمْس)** — "chuchotement" en arabe — est une application mobile conçue pour les adolescents tunisiens (13–20 ans).

En Tunisie, la santé mentale reste un tabou. Les jeunes souffrent en silence, sans espace pour exprimer ce qu'ils ressentent. Hams répond à ce problème en offrant :

- Un espace **privé, sans jugement**, disponible 24h/24
- Des **compagnons IA** à personnalités distinctes, adaptés à chaque état d'esprit
- Des **outils psychologiques** basés sur les techniques TCC, rendus accessibles et compréhensibles pour les ados
- Un support **trilingue** : Arabe / Français / Anglais avec support RTL natif

> Hams n'est pas un outil médical. C'est un ami intelligent et bienveillant.

---

## ✨ Fonctionnalités

### 🤖 5 Avatars IA à personnalités multiples

Le cœur innovant de l'app. Même modèle IA, 5 system prompts distincts, 5 expériences uniques.

| Avatar | Personnalité | Approche thérapeutique |
|--------|-------------|----------------------|
| **Jule** | Pote drôle et décalé | Humour bienveillant, dédramatisation |
| **Leo** | Calme et bienveillant | TCC, questions douces, respiration |
| **Nyx** | Énergique et motivant | Activation comportementale, défis |
| **Sage** | Analytique silencieux | Restructuration cognitive, 3 mots / 1 question |
| **Echo** | Le miroir | Reformulation, validation émotionnelle |

- Chaque avatar est **renommable** par l'utilisateur
- **Détection automatique** des pensées négatives
- Reformulation TCC dans le **style propre à chaque personnalité**
- **Historique persistant** par avatar, effaçable à la demande

---

### 🎡 Roue des émotions interactive

Basée sur le modèle de Plutchik, la roue aide l'ado à nommer précisément ce qu'il ressent.

- 6 émotions principales avec 5 nuances chacune
- Pour chaque nuance sélectionnée : un **conseil concret** basé sur la TCC
- Techniques incluses : respiration 4-7-8, ancrage 5-4-3-2-1, restructuration cognitive

---

### 📓 Journal Intime Intelligent

- Entrées texte quotidiennes, 100% privées
- Sélection du mood à chaque entrée
- Historique consultable avec date et mood associé

---

### 🧰 Boîte à Outils Interactive

Trois exercices entièrement guidés et interactifs :

**Respiration 4-7-8**
Animation de cercle respiratoire · 3 cycles guidés · Indicateurs de phase colorés

**Ancrage 5-4-3-2-1**
Exercice pas à pas · 5 sens · Progression visuelle · Retour au moment présent

**Recadrage TCC**
Scénarios de pensées négatives · Quiz interactif · Reframe psychologique expliqué

- **Défi quotidien** renouvelé chaque jour (14 défis en rotation)

---

### 🆘 Bouton SOS

Accessible depuis la barre de navigation à tout moment.

- Message de soutien psychologique renouvelé toutes les 6h
- Guide de respiration d'urgence
- Numéros d'urgence tunisiens avec appel direct
- Message bienveillant de clôture

---

### ⚙️ Paramètres

- Modification du prénom et de l'âge
- Changement de langue en temps réel
- Renommage des avatars
- Effacement de l'historique des conversations
- Réinitialisation de l'onboarding

---

### 🌍 Multilingue & Accessibilité

- Support complet **Arabe / Français / Anglais**
- Alignement RTL natif pour l'arabe
- Cititations psychologiques dans les 3 langues
- Conseils TCC adaptés culturellement

---

## 🛠️ Stack Technique

```
Frontend          IA & Backend        Données
──────────        ────────────        ───────────
React Native      Groq API            AsyncStorage
Expo SDK 54       LLaMA 3.3 70B       Firebase Auth
Expo Router       System Prompts x5   Firebase Firestore
Vector Icons      Historique complet
Context API       Détection auto.
```

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Mobile | React Native + Expo | Cross-platform iOS & Android |
| Navigation | Expo Router | File-based routing, tabs, deep linking |
| Intelligence IA | Groq API — LLaMA 3.3 70B | Chatbot multi-avatar, détection pensées |
| Storage local | AsyncStorage | Historique chats, profil, préférences |
| Storage cloud | Firebase | Auth, sync données |
| Icons | @expo/vector-icons | Feather, Ionicons, MaterialCommunity |
| i18n | Context API custom | AR / FR / EN avec RTL natif |

---

### Architecture des Avatars

```
User message
     │
     ▼
Context (lang, userName, mood)
     │
     ▼
System Prompt (unique par avatar)  ←── 5 prompts distincts
     │
     ▼
Groq API — LLaMA 3.3 70B
     │
     ▼
Détection pensées négatives
     │
     ▼
Reformulation TCC (style avatar)
     │
     ▼
Response → AsyncStorage (historique)
```

---

## 🚀 Installation

### Prérequis

- Node.js ≥ 18
- Expo CLI
- Compte [Groq](https://console.groq.com) (gratuit)

### Étapes

```bash
# 1. Clone le repo
git clone https://github.com/selma17/Hams
cd hams

# 2. Installe les dépendances
npm install --legacy-peer-deps

# 3. Configure les variables d'environnement
cp .env.example .env
# Édite .env et ajoute ta clé Groq

# 4. Lance l'app
npx expo start
```

### Variables d'environnement

Crée un fichier `.env` à la racine :

```env
EXPO_PUBLIC_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ Ne jamais committer le fichier `.env`. Il est déjà dans `.gitignore`.

---

## 📁 Structure du projet

```
hams/
├── app/                    # Écrans (Expo Router)
│   ├── _layout.js          # Navigation tabs + LangProvider
│   ├── index.js            # Redirect onboarding/home
│   ├── onboarding.js       # Langue → Profil → Avatars
│   ├── home.js             # Écran principal
│   ├── chat.js             # Chatbot multi-avatar
│   ├── journal.js          # Journal intime
│   ├── tools.js            # Boîte à outils interactive
│   ├── sos.js              # Ressources d'urgence
│   └── settings.js         # Paramètres utilisateur
│
├── components/
│   └── EmotionWheel.js     # Roue des émotions interactive
│
├── constants/
│   ├── avatars.js          # Définition + system prompts des 5 avatars
│   ├── colors.js           # Palette de couleurs globale
│   └── translations.js     # Traductions AR / FR / EN
│
├── context/
│   └── LangContext.js      # Provider langue global
│
├── services/
│   └── groq.js             # Client API Groq
│
├── .env                    # Variables d'environnement (non committé)
├── .gitignore
├── app.json
└── package.json
```

---

## 🧠 Approche Psychologique

Hams intègre des techniques issues de la **Thérapie Cognitive et Comportementale (TCC)** adaptées au langage et à la réalité des adolescents :

| Technique | Implémentation dans Hams |
|-----------|--------------------------|
| Restructuration cognitive | Avatar Sage + Recadrage TCC interactif |
| Activation comportementale | Avatar Nyx + Défis quotidiens |
| Mindfulness | Respiration 4-7-8 + Ancrage 5-4-3-2-1 |
| Validation émotionnelle | Avatar Echo + Roue des émotions |
| Psychoéducation | Conseils contextuels dans la roue des émotions |

> Hams ne remplace pas un professionnel de santé mentale. En cas de détresse sévère, l'app redirige vers des ressources professionnelles via le bouton SOS.

---

## 👥 Équipe

Projet réalisé en **12h** dans le cadre du **ARSII Open Challenge 2025**.

---

## 📄 Licence

Ce projet est développé dans le cadre d'un hackathon éducatif.

---

<div align="center">

*Fait avec 🤍 pour chaque ado qui mérite un espace pour souffler*

**هَمْس — Hams**

</div>