<!--
============================================================================
Nom du fichier : README.md
Auteur         : Bruno DELNOZ
Email          : bruno.delnoz@protonmail.com
Path complet   : /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension/README.md
Target usage   : Documentation principale de l'extension Whisper Local STT pour Brave
Version        : 2.0.0
Date           : 2025-10-31

CHANGELOG:
-----------
v2.0.0 - 2025-10-31
  - Documentation des nouvelles fonctionnalités v2.0.0
  - Ajout section auto-stop après 10s de silence
  - Ajout section ENTER automatique
  - Mise à jour des exemples d'utilisation
  - Ajout header avec versionnement

v1.0.0 - 2025-10-31
  - Documentation initiale de l'extension
  - Installation et configuration
  - Utilisation de base
  - Dépannage
============================================================================
-->

# 🎤 Whisper Local STT - Extension Brave

Extension Brave pour la transcription vocale 100% locale utilisant whisper.cpp. Aucune donnée n'est envoyée sur internet, tout reste sur votre machine.

**Version 2.0.0** - Interface vocale complète avec auto-stop intelligent et envoi automatique !

---

## ✨ Fonctionnalités

### 🎯 Principales
- ✅ **Transcription vocale entièrement locale** - Zéro cloud, zéro API externe
- ✅ **Auto-stop après 10 secondes de silence** ⚡ NOUVEAU v2.0.0
- ✅ **ENTER automatique** après transcription ⚡ NOUVEAU v2.0.0
- ✅ **Support de 9+ langues** (français, anglais, espagnol, etc.)
- ✅ **Insertion automatique** dans n'importe quel champ de texte
- ✅ **Compatible éditeurs complexes** (Claude.ai, Gmail, WhatsApp Web, etc.)
- ✅ **Interface simple et rapide**
- ✅ **Confidentialité totale** - aucune donnée envoyée en ligne

### 🆕 Nouveautés v2.0.0

#### 🎤 Détection de silence intelligente
- **Auto-stop après 10 secondes** sans son
- **Compte à rebours visuel** pendant l'enregistrement
- **Plus besoin de cliquer** sur "Arrêter l'enregistrement"
- Parfait pour les longues dictées

#### ⏎ Envoi automatique
- **Appuie sur ENTER** automatiquement après l'insertion
- Idéal pour **Claude.ai** - parlez et votre message est envoyé !
- Fonctionne aussi sur **Google, Gmail, formulaires**, etc.
- Conversation fluide et naturelle

---

## 📋 Prérequis

- **Brave Browser** (ou Chromium/Chrome)
- **whisper.cpp** installé et compilé
- **Un modèle Whisper** (tiny, base, small, medium, large)
- **ffmpeg** pour la conversion audio
- **Kali Linux** (ou toute distribution Linux)

---

## 🚀 Installation rapide

Voir le fichier **INSTALL.md** pour l'installation complète détaillée.

```bash
# 1. Charger l'extension dans Brave
brave://extensions/
# Mode développeur → Charger l'extension non empaquetée
# Sélectionner : /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension

# 2. Lancer whisper
cd /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension
./start-whisper.sh

# 3. Utiliser l'extension !
```

---

## 🎯 Utilisation

### Mode conversationnel (parfait pour Claude.ai)

1. **Ouvrir Claude.ai** (ou n'importe quel site)
2. **Cliquer dans le champ** de chat
3. **Cliquer sur l'icône** 🎤 de l'extension
4. **Sélectionner "Français"** dans le menu déroulant
5. **Cliquer sur "Démarrer l'enregistrement"**
6. **Parler naturellement** : "Bonjour Claude, explique-moi la photosynthèse"
7. **Se taire 10 secondes** → Auto-stop automatique ⚡
8. **Attendre 2-3 secondes** → Transcription
9. ✨ **Message envoyé automatiquement à Claude !**

### Mode dictée (pour formulaires, emails, etc.)

1. **Cliquer dans un champ** de texte
2. **Enregistrer votre dictée**
3. **Auto-stop après 10s** de silence
4. Le texte s'insère et **ENTER est appuyé**

### Configuration avancée

#### Désactiver l'ENTER automatique
Si vous ne voulez pas que l'extension appuie sur ENTER automatiquement, vous pouvez modifier le fichier `popup.js` ligne 461 :

```javascript
// Changer de:
pressEnter: true

// Vers:
pressEnter: false
```

Puis recharger l'extension dans `brave://extensions/`.

#### Ajuster le délai de silence
Par défaut : 10 secondes. Pour modifier, éditez `popup.js` ligne 43 :

```javascript
// 5 secondes
const SILENCE_DURATION = 5000;

// 15 secondes
const SILENCE_DURATION = 15000;
```

---

## 🎨 Cas d'usage

### 💬 Discussion vocale avec Claude
```
Vous : 🎤 "Claude, écris-moi un poème sur l'automne"
[10 secondes de silence]
→ Transcription automatique
→ ENTER automatique
→ Claude répond !
```

### 📧 Rédaction d'emails
```
Gmail → Nouveau message
🎤 "Bonjour Jean, je te confirme notre rendez-vous de demain à 14h"
→ Auto-stop après silence
→ Texte inséré et prêt
```

### 🔍 Recherches Google
```
Google.com → Barre de recherche
🎤 "Météo Paris demain"
→ Auto-stop
→ ENTER automatique
→ Résultats affichés !
```

### 📝 Prise de notes
```
Google Docs / Word Online
🎤 Dictez vos notes longues
→ Auto-stop quand vous réfléchissez
→ Continuez quand vous êtes prêt
```

---

## ⚙️ Configuration

### Changer de modèle Whisper

**Modèles disponibles** (qualité croissante) :

| Modèle | Taille | Vitesse | Qualité | Usage |
|--------|--------|---------|---------|-------|
| tiny | 75 MB | ⚡⚡⚡⚡⚡ | ⭐⭐ | Tests rapides |
| base | 147 MB | ⚡⚡⚡⚡ | ⭐⭐⭐ | Usage quotidien |
| small | 487 MB | ⚡⚡⚡ | ⭐⭐⭐⭐ | Bon compromis |
| medium | 1.5 GB | ⚡⚡ | ⭐⭐⭐⭐⭐ | Haute qualité |
| **large-v3** | **3 GB** | **⚡** | **⭐⭐⭐⭐⭐⭐** | **Recommandé** |

Pour changer de modèle, éditez `start-whisper.sh` ligne 14 :

```bash
MODEL="models/ggml-large-v3.bin"
```

### Forcer une langue

Dans l'interface de l'extension :
- 🇫🇷 **Français** (recommandé pour le français)
- 🇬🇧 Anglais
- 🇪🇸 Espagnol
- 🌍 Auto-détection (peut traduire)

⚠️ **Important** : Toujours sélectionner "Français" pour éviter que whisper ne traduise vos paroles en anglais !

---

## 🔧 Architecture technique

### Composants

```
Extension Brave (Manifest V3)
├── popup.js (v2.0.0)
│   ├── Enregistrement audio (MediaRecorder)
│   ├── Détection de silence (AudioContext + AnalyserNode)
│   ├── Auto-stop après 10s
│   └── Communication avec whisper.cpp
│
├── content.js (v2.0.0)
│   ├── Insertion de texte (3 méthodes)
│   ├── Support React/Vue/Angular
│   ├── Simulation touche ENTER
│   └── Compatibilité contentEditable
│
└── whisper.cpp (serveur local)
    ├── Port 8080
    ├── Modèle large-v3 (3GB)
    └── Conversion audio automatique
```

### Flux de données

```
Microphone → MediaRecorder → AudioContext
                                  ↓
                            Analyse du son
                                  ↓
                    Silence 10s ? → Auto-stop
                                  ↓
                          Blob audio (webm)
                                  ↓
                    whisper.cpp (localhost:8080)
                                  ↓
                            Transcription
                                  ↓
                    Content Script (injection)
                                  ↓
                        Insertion + ENTER
```

---

## 🐛 Dépannage

### ❌ "Serveur Whisper non disponible"

**Solution** :
```bash
# Vérifier que whisper tourne
curl http://localhost:8080/health

# Si pas de réponse, lancer whisper
./start-whisper.sh
```

### ❌ L'auto-stop ne fonctionne pas

**Causes possibles** :
- Bruit ambiant trop élevé
- Microphone trop sensible

**Solutions** :
1. Augmenter le seuil de silence dans `popup.js` ligne 42 :
```javascript
const SILENCE_THRESHOLD = 0.02; // Augmenter à 0.02 ou 0.03
```

2. Vérifier le niveau du micro dans les paramètres système

### ❌ ENTER ne s'appuie pas après insertion

**Solutions** :
1. Vérifier la console navigateur (F12) pour les erreurs
2. Certains sites bloquent les événements clavier simulés
3. Dans ce cas, le texte est inséré mais vous devez appuyer sur ENTER manuellement

### ❌ Transcription lente avec large-v3

**Solutions** :
1. Utiliser un modèle plus petit (medium ou small)
2. Augmenter les threads CPU dans `start-whisper.sh` :
```bash
--threads 8
```

---

## 📁 Structure du projet

```
braveVTTextension/
├── manifest.json          # Configuration Manifest V3
├── popup.html             # Interface utilisateur
├── popup.js              # Logique principale (v2.0.0)
├── content.js            # Injection de texte (v2.0.0)
├── icon48.png            # Icône 48x48
├── icon96.png            # Icône 96x96
├── start-whisper.sh      # Script de démarrage whisper
├── README.md             # Ce fichier (v2.0.0)
└── INSTALL.md            # Guide d'installation détaillé
```

---

## 🔒 Confidentialité et sécurité

- ✅ **100% local** - Aucune connexion internet requise
- ✅ **Zéro tracking** - Aucune donnée collectée
- ✅ **Zéro cloud** - Tout traité sur votre machine
- ✅ **Open source** - Code entièrement auditable
- ✅ **Manifest V3** - Nouvelles permissions sécurisées de Brave

**Aucune donnée audio n'est jamais** :
- Envoyée sur internet
- Stockée sur un serveur
- Partagée avec des tiers
- Utilisée pour de l'entraînement IA

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer des améliorations
- Soumettre une pull request

---

## 📝 Licence

[À définir - MIT, GPL, Apache, etc.]

---

## 🙏 Remerciements

- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) par Georgi Gerganov
- [OpenAI Whisper](https://github.com/openai/whisper) pour le modèle
- La communauté Brave pour le support des extensions

---

## 📞 Support

Pour toute question ou problème :
- Consultez **INSTALL.md** pour l'installation
- Vérifiez la section **Dépannage** ci-dessus
- Ouvrez une issue sur GitHub

---

## 🎯 Roadmap

### Fonctionnalités futures envisagées
- [ ] Support de plus de langues
- [ ] Raccourcis clavier personnalisables
- [ ] Mode dictée continue (sans limite de temps)
- [ ] Historique des transcriptions
- [ ] Export des transcriptions
- [ ] Support multi-micros
- [ ] Réglages avancés dans l'interface

---

**Note de confidentialité** : Cette extension ne collecte aucune donnée. Tout le traitement audio se fait localement sur votre machine. Aucune donnée n'est envoyée sur internet.

**Auteur** : Bruno DELNOZ - bruno.delnoz@protonmail.com
**Version** : 2.0.0 - 2025-10-31
