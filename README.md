# هَمْس — Hams

> L'espace safe pour la santé mentale des adolescents

## 🌿 À propos

Hams est une application mobile qui offre aux adolescents (13-20 ans) un espace privé, sans jugement, pour comprendre leurs émotions, recadrer leurs pensées négatives et se sentir soutenus.

## ✨ Fonctionnalités

- 🤖 **5 Avatars IA** à personnalités multiples (Jule, Leo, Nyx, Sage, Echo)
- 🧠 **Détection automatique** des pensées négatives + reformulation TCC
- 🎡 **Roue des émotions** interactive (basée sur Plutchik)
- 📓 **Journal intime** avec suivi du mood
- 🧰 **Boîte à outils** (respiration 4-7-8, ancrage 5-4-3-2-1, recadrage)
- 🆘 **Bouton SOS** avec ressources d'urgence tunisiennes
- 🌍 **Trilingue** : Arabe / Français / Anglais avec RTL natif
- 💬 **Citations psychologiques** renouvelées toutes les 6h

## 🛠️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| Mobile | React Native + Expo |
| Navigation | Expo Router |
| IA | Groq API — LLaMA 3.3 70B |
| Storage | AsyncStorage + Firebase |
| Icons | @expo/vector-icons |
| i18n | Context API custom |

## 🚀 Installation

```bash
git clone https://github.com/selma17/Hams
cd hams
npm install --legacy-peer-deps
```

Crée un fichier `.env` :