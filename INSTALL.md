<!--
Document : INSTALL.md
Auteur : Bruno DELNOZ
Email : bruno.delnoz@protonmail.com
Version : v2.0.1
Date : 2026-04-20 00:00
-->

<!--
============================================================================
Nom du fichier : INSTALL.md
Auteur         : Bruno DELNOZ
Email          : bruno.delnoz@protonmail.com
Path complet   : /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension/INSTALL.md
Target usage   : Guide d'installation détaillé de l'extension Whisper Local STT pour Brave
Version        : 2.0.0
Date           : 2025-10-31

CHANGELOG:
-----------
v2.0.0 - 2025-10-31
  - Mise à jour pour les fonctionnalités v2.0.0
  - Ajout section utilisation auto-stop et ENTER automatique
  - Ajout exemples d'utilisation avec Claude.ai
  - Mise à jour des captures d'écran théoriques
  - Ajout header avec versionnement

v1.0.0 - 2025-10-31
  - Guide d'installation initial
  - Instructions étape par étape
  - Configuration et dépannage
============================================================================
-->

# 📦 Installation - Whisper Local STT pour Brave v2.0.0

Guide d'installation complet pour l'extension de transcription vocale 100% locale avec **auto-stop intelligent** et **ENTER automatique**.

---


## Documentation synchronization update (2026-04-20)

This installation guide has been synchronized with the scripts currently present in the repository.

### Effective versions and defaults
- `start-whisper.sh` version: **2.3.0**
- `install.sh` version: **1.1.0**
- Extension manifest version: **2.2.0**
- Default Whisper model in launcher: **`ggml-small.bin`**

### Command usage aligned with current files
```bash
# Launcher help
./start-whisper.sh --help

# Start Whisper with default settings
./start-whisper.sh --exec

# Install/configure extension files (script currently not executable in repo)
bash ./install.sh --exec
```

### Additional current options
- `start-whisper.sh`: `--listmodel`, `--test`, `--model`, `--whisper-path`, `--changelog`
- `install.sh`: `--delay`, `--silence`, `--auto-enter`, `--language`, `--whisper-path`, `--simulate`, `--prerequis`, `--install`, `--changelog`

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ **Brave Browser** (ou Chromium/Chrome)
- ✅ **whisper.cpp** déjà installé et compilé
- ✅ **Un modèle Whisper** (tiny, base, small, medium, large-v3)
- ✅ **ffmpeg** installé (pour la conversion audio)
- ✅ **Kali Linux** (ou toute distribution Linux)

---

## 🚀 Installation en 3 étapes

### Étape 1 : Vérifier whisper.cpp

Assurez-vous que whisper.cpp fonctionne correctement.

```bash
# Aller dans votre dossier whisper.cpp
cd /mnt/data2_78g/Security/scripts/AI_Projects/DeepEcho_whisper/whisper.cpp

# Vérifier que le serveur existe
ls -la build/bin/whisper-server

# Vérifier que le modèle existe
ls -la models/ggml-large-v3.bin  # Ou ggml-base.bin, ggml-medium.bin, etc.

# Vérifier que ffmpeg est installé (requis pour --convert)
ffmpeg -version
```

**Si ffmpeg n'est pas installé** :
```bash
sudo apt update
sudo apt install ffmpeg -y
```

Si tout est OK, passez à l'étape suivante. ✅

---

### Étape 2 : Préparer l'extension

Tous les fichiers sont déjà dans le dossier du projet :

```bash
cd /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension

# Vérifier la structure
ls -la
```

Vous devriez voir :
```
braveVTTextension/
├── manifest.json         # Configuration Manifest V3
├── popup.html            # Interface
├── popup.js             # v2.0.0 - Avec auto-stop et détection silence
├── content.js           # v2.0.0 - Avec ENTER automatique
├── icon48.png           # Icône 48x48
├── icon96.png           # Icône 96x96
├── start-whisper.sh     # Script de lancement whisper
├── README.md            # Documentation complète
└── INSTALL.md           # Ce fichier
```

**Rendre le script exécutable** :
```bash
chmod +x start-whisper.sh
```

---

### Étape 3 : Charger l'extension dans Brave

#### 3.1 Ouvrir la page des extensions

1. Ouvrez **Brave**
2. Dans la barre d'adresse, tapez : `brave://extensions/`
3. Appuyez sur **Entrée**

#### 3.2 Activer le mode développeur

En haut à droite de la page, activez **"Mode développeur"** (Developer mode).

#### 3.3 Charger l'extension

1. Cliquez sur **"Charger l'extension non empaquetée"** (Load unpacked)
2. Naviguez vers : `/mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension`
3. Sélectionnez le dossier et cliquez sur **"Ouvrir"**

✅ L'extension est maintenant installée !

Vous devriez voir l'icône 🎤 dans la barre d'outils de Brave.

---

## 🎯 Démarrage et utilisation

### Démarrer le serveur Whisper

**Option A : Avec le script fourni (recommandé)**

```bash
cd /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension
./start-whisper.sh
```

Le script :
- ✅ Vérifie que tout est en place
- ✅ Configure automatiquement les bibliothèques
- ✅ Lance le serveur avec le modèle large-v3 sur http://127.0.0.1:8080
- ✅ Active la conversion audio automatique (--convert)

**Option B : Manuellement**

```bash
cd /mnt/data2_78g/Security/scripts/AI_Projects/DeepEcho_whisper/whisper.cpp
LD_LIBRARY_PATH=./build/src:./build/ggml/src:$LD_LIBRARY_PATH \
./build/bin/whisper-server \
    -m models/ggml-large-v3.bin \
    --port 8080 \
    --host 127.0.0.1 \
    --convert
```

**Le serveur est prêt quand vous voyez** :
```
whisper server listening at http://127.0.0.1:8080
```

⚠️ **Laissez ce terminal ouvert** tant que vous utilisez l'extension !

---

### Utiliser l'extension - Mode conversationnel v2.0.0

#### 🎤 Exemple : Discussion avec Claude.ai

1. **Ouvrir Claude.ai** dans Brave
2. **Cliquer** sur l'icône 🎤 de l'extension
3. **Tester la connexion** : cliquez sur "Test connexion"
   - ✅ Vous devriez voir : "Connecté au serveur Whisper"
4. **Sélectionner "Français"** dans le menu déroulant
   - ⚠️ Important pour éviter que whisper ne traduise en anglais
5. **Cliquer dans le champ** de chat de Claude
6. **Cliquer** sur "Démarrer l'enregistrement"
7. **Parler clairement** : "Bonjour Claude, explique-moi la relativité générale"
8. **Arrêter de parler** et attendre...
   - Vous verrez le compte à rebours : "auto-stop dans 10s... 9s... 8s..."
9. 🎯 **Auto-stop après 10 secondes de silence**
10. ⏳ "Transcription en cours..." (2-5 secondes avec large-v3)
11. ✨ **Magie** :
    - Le texte s'insère dans le champ
    - **ENTER est appuyé automatiquement**
    - Votre message est envoyé à Claude !
    - Claude commence à répondre !

#### 🎯 Avantages du mode v2.0.0

**Plus besoin de** :
- ❌ Cliquer sur "Arrêter l'enregistrement"
- ❌ Appuyer sur ENTER manuellement
- ❌ Toucher la souris ou le clavier

**Conversation 100% mains libres !** 🎤✨

---

### Autres cas d'usage

#### 📧 Rédaction d'emails (Gmail)

```bash
1. Ouvrir Gmail
2. Cliquer sur "Nouveau message"
3. Cliquer dans le champ du message
4. 🎤 "Bonjour Jean, je confirme notre rendez-vous de demain"
5. [10s de silence]
6. ✅ Texte inséré et prêt (ENTER n'est pas appuyé dans les emails)
```

#### 🔍 Recherche Google

```bash
1. Ouvrir google.com
2. Cliquer dans la barre de recherche
3. 🎤 "météo Paris demain"
4. [10s de silence]
5. ✅ Recherche lancée automatiquement avec ENTER !
```

#### 📝 Prise de notes

```bash
1. Google Docs / Word Online
2. Cliquer dans le document
3. 🎤 Dictez vos notes
4. [Silence 10s] → auto-stop
5. 🎤 Continuez quand vous êtes prêt
6. Transcription fluide et naturelle
```

---

## ⚙️ Configuration

### Changer de modèle Whisper

Pour plus ou moins de précision/vitesse, modifiez `start-whisper.sh` ligne 14 :

**Modèles disponibles** :

| Modèle | Commande | Vitesse | Qualité | Recommandation |
|--------|----------|---------|---------|----------------|
| tiny | `MODEL="models/ggml-tiny.bin"` | ⚡⚡⚡⚡⚡ | ⭐⭐ | Tests rapides |
| base | `MODEL="models/ggml-base.bin"` | ⚡⚡⚡⚡ | ⭐⭐⭐ | Usage léger |
| small | `MODEL="models/ggml-small.bin"` | ⚡⚡⚡ | ⭐⭐⭐⭐ | Bon compromis |
| medium | `MODEL="models/ggml-medium.bin"` | ⚡⚡ | ⭐⭐⭐⭐⭐ | Haute qualité |
| large-v3 | `MODEL="models/ggml-large-v3.bin"` | ⚡ | ⭐⭐⭐⭐⭐⭐ | **Recommandé** |

Après modification, **relancez le serveur** :
```bash
# Arrêter l'ancien serveur (Ctrl+C)
# Relancer
./start-whisper.sh
```

---

### Ajuster le délai d'auto-stop

Par défaut : **10 secondes** de silence avant auto-stop.

Pour modifier, éditez `popup.js` ligne 43 :

```javascript
// 5 secondes (plus rapide)
const SILENCE_DURATION = 5000;

// 15 secondes (plus de temps de réflexion)
const SILENCE_DURATION = 15000;

// 20 secondes (dictée longue)
const SILENCE_DURATION = 20000;
```

Après modification, **rechargez l'extension** :
```
brave://extensions/ → 🔄 Recharger
```

---

### Désactiver l'ENTER automatique

Si vous voulez insérer le texte **sans** appuyer sur ENTER automatiquement, éditez `popup.js` ligne 461 :

```javascript
// AVANT (ENTER activé)
pressEnter: true

// APRÈS (ENTER désactivé)
pressEnter: false
```

Puis **rechargez l'extension**.

---

### Ajuster la sensibilité du silence

Si l'auto-stop se déclenche trop tôt (bruit ambiant), augmentez le seuil dans `popup.js` ligne 42 :

```javascript
// Plus sensible (détecte plus facilement le silence)
const SILENCE_THRESHOLD = 0.01;

// Moins sensible (tolère plus de bruit)
const SILENCE_THRESHOLD = 0.02;  // ou 0.03
```

---

### Optimiser les performances

**Plus de threads CPU** (plus rapide) - éditez `start-whisper.sh` :

```bash
./build/bin/whisper-server \
    -m "$MODEL" \
    --port $PORT \
    --host $HOST \
    --convert \
    --threads 8      # Ajoutez cette ligne
```

**Activer le GPU** (si disponible et compilé avec support GPU) :

```bash
./build/bin/whisper-server \
    -m "$MODEL" \
    --port $PORT \
    --host $HOST \
    --convert \
    --gpu            # Ajoutez cette ligne
```

---

## 🐛 Dépannage

### ❌ "Serveur Whisper non disponible"

**Causes possibles** :
1. Le serveur whisper n'est pas démarré
2. Mauvais port ou adresse
3. Firewall bloque le port 8080

**Solutions** :

```bash
# 1. Vérifier que whisper tourne
curl http://localhost:8080/health
# Devrait répondre avec du JSON

# 2. Si pas de réponse, lancer whisper
cd /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension
./start-whisper.sh

# 3. Vérifier les logs du serveur whisper dans le terminal
```

---

### ❌ "Erreur de transcription" / Format audio non supporté

**Cause** : Le serveur ne peut pas lire le format webm.

**Solution** : Assurez-vous que whisper est lancé avec `--convert` :

```bash
# Vérifier dans start-whisper.sh qu'il y a bien:
--convert

# Vérifier que ffmpeg est installé:
ffmpeg -version
```

---

### ❌ "Impossible d'accéder au microphone"

**Causes possibles** :
1. Permission refusée dans Brave
2. Microphone utilisé par une autre application

**Solutions** :

```bash
# 1. Autoriser le micro dans Brave
Brave → Paramètres → Confidentialité → Autorisations → Microphone
→ Autoriser

# 2. Fermer les applications utilisant le micro
# (Zoom, Discord, Teams, etc.)

# 3. Vérifier que le micro fonctionne
arecord -l
```

---

### ❌ L'auto-stop se déclenche trop vite

**Cause** : Bruit ambiant détecté comme du son.

**Solutions** :

1. **Augmenter le seuil de silence** dans `popup.js` ligne 42 :
```javascript
const SILENCE_THRESHOLD = 0.02;  // ou 0.03, 0.04
```

2. **Réduire le bruit ambiant** (fermer fenêtres, éteindre ventilateurs)

3. **Utiliser un micro directionnel** plus proche de la bouche

---

### ❌ L'auto-stop ne se déclenche pas

**Cause** : Seuil trop élevé ou micro trop silencieux.

**Solutions** :

1. **Réduire le seuil** dans `popup.js` ligne 42 :
```javascript
const SILENCE_THRESHOLD = 0.005;  // Plus sensible
```

2. **Augmenter le volume du micro** dans les paramètres système

3. **Se rapprocher du microphone**

---

### ❌ ENTER ne s'appuie pas après insertion

**Causes possibles** :
1. Site web bloque les événements clavier simulés
2. Problème de compatibilité avec l'éditeur

**Solutions** :

1. **Vérifier la console** (F12) pour les erreurs

2. **Certains sites sont protégés** (sites bancaires, etc.) et bloquent les événements simulés - c'est normal et voulu pour la sécurité

3. **Dans ce cas**, le texte est bien inséré, mais vous devez appuyer sur ENTER manuellement

4. **Désactiver ENTER automatique** si cela pose problème (voir section Configuration)

---

### ❌ Transcription lente avec large-v3

**Cause** : Le modèle large-v3 (3 GB) est très gourmand.

**Solutions** :

1. **Utiliser un modèle plus petit** (medium, small, base)

2. **Augmenter les threads** dans `start-whisper.sh` :
```bash
--threads 8
```

3. **Fermer les applications gourmandes** pendant l'utilisation

4. **Vérifier la RAM disponible** :
```bash
free -h
# Large-v3 nécessite environ 4-5 GB de RAM
```

---

### ❌ Transcription en anglais alors que je parle français

**Cause** : "Auto-détection" peut détecter l'anglais par erreur.

**Solution** : **Toujours sélectionner "Français"** dans le menu déroulant de l'extension !

---

### ❌ Le texte ne s'insère pas dans le champ

**Causes possibles** :
1. Vous n'avez pas cliqué dans le champ avant d'enregistrer
2. Le site bloque l'insertion automatique
3. Problème de compatibilité avec l'éditeur

**Solutions** :

1. **Toujours cliquer dans le champ** AVANT de commencer l'enregistrement

2. **Vérifier la console** (F12 → Console) pour les messages `[Whisper STT Content]`

3. **Fallback presse-papiers** : Si l'insertion échoue, le texte est copié dans le presse-papiers → faites Ctrl+V

4. **Recharger la page** (F5) et réessayer

---

## 🔄 Mise à jour de l'extension

Si vous modifiez le code de l'extension :

```bash
# 1. Faire vos modifications dans les fichiers
vim popup.js
# ou
vim content.js

# 2. Recharger l'extension dans Brave
# Aller sur brave://extensions/
# Cliquer sur 🔄 Recharger sous l'extension

# 3. Recharger la page web (F5)

# 4. Tester les modifications
```

---

## 🚀 Démarrage automatique (optionnel)

Pour lancer whisper automatiquement au démarrage de Kali :

### Créer un service systemd

```bash
sudo nano /etc/systemd/system/whisper-stt.service
```

Contenu du fichier :
```ini
[Unit]
Description=Whisper.cpp Server for STT Extension
After=network.target

[Service]
Type=simple
User=nox
WorkingDirectory=/mnt/data2_78g/Security/scripts/AI_Projects/DeepEcho_whisper/whisper.cpp
Environment="LD_LIBRARY_PATH=/mnt/data2_78g/Security/scripts/AI_Projects/DeepEcho_whisper/whisper.cpp/build/src:/mnt/data2_78g/Security/scripts/AI_Projects/DeepEcho_whisper/whisper.cpp/build/ggml/src"
ExecStart=/mnt/data2_78g/Security/scripts/AI_Projects/DeepEcho_whisper/whisper.cpp/build/bin/whisper-server -m models/ggml-large-v3.bin --port 8080 --host 127.0.0.1 --convert
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Activer et démarrer :
```bash
sudo systemctl daemon-reload
sudo systemctl enable whisper-stt
sudo systemctl start whisper-stt

# Vérifier le statut
sudo systemctl status whisper-stt

# Voir les logs
journalctl -u whisper-stt -f
```

---

## 🎉 C'est terminé !

Votre extension est maintenant installée et fonctionnelle avec les nouvelles fonctionnalités v2.0.0 !

### Récapitulatif rapide

```bash
# 1. Démarrer whisper (si pas en service)
./start-whisper.sh

# 2. Ouvrir Brave et aller sur Claude.ai (ou autre)

# 3. Cliquer dans le champ de chat

# 4. Cliquer sur l'icône 🎤 de l'extension

# 5. Sélectionner "Français"

# 6. Cliquer sur "Démarrer l'enregistrement"

# 7. Parler naturellement

# 8. Se taire 10 secondes → Auto-stop ⚡

# 9. Message envoyé automatiquement ! ✨
```

---

## 📝 Notes importantes v2.0.0

### Auto-stop après 10s de silence
- 🎯 **Avantage** : Plus besoin de cliquer sur "Arrêter"
- ⚙️ **Ajustable** : Modifiez `SILENCE_DURATION` dans popup.js
- 🎤 **Sensibilité** : Ajustez `SILENCE_THRESHOLD` selon votre environnement

### ENTER automatique
- 🎯 **Avantage** : Envoi immédiat du message (parfait pour Claude.ai)
- ⚙️ **Désactivable** : Changez `pressEnter: false` dans popup.js
- 🛡️ **Sécurité** : Certains sites bloquent les événements simulés (voulu)

### Confidentialité
- 🔒 **100% local** : Aucune donnée n'est envoyée sur internet
- 🎤 **Aucun stockage** : L'audio est traité et immédiatement supprimé
- 🌍 **Zéro cloud** : Tout reste sur votre machine

---

## 🆘 Support

**Problèmes ?**
1. Vérifiez le terminal où whisper tourne (logs d'erreur)
2. Ouvrez la console de l'extension : `brave://extensions/` → Détails → Inspecter les vues
3. Ouvrez la console de la page : F12 → Console
4. Consultez le README.md pour plus d'infos

---

**Bon usage de votre interface vocale ! 🎤✨**

**Auteur** : Bruno DELNOZ - bruno.delnoz@protonmail.com  
**Version** : 2.0.0 - 2025-10-31
