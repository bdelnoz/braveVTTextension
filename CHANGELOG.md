<!--
============================================================================
Nom du fichier : CHANGELOG.md
Auteur         : Bruno DELNOZ
Email          : bruno.delnoz@protonmail.com
Path complet   : /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension/CHANGELOG.md
Target usage   : Historique complet des versions de l'extension Whisper Local STT
Version        : 2.0.0
Date           : 2025-10-31
============================================================================
-->

# 📋 Changelog - Whisper Local STT pour Brave

Historique complet de toutes les versions de l'extension.

---

## Version 2.0.0 - 2025-10-31

### 🎯 Fonctionnalités majeures

#### Auto-stop intelligent après 10 secondes de silence
- **Ajout détection de silence en temps réel** avec AudioContext et AnalyserNode
- **Auto-stop automatique** après 10 secondes sans son détecté
- **Compte à rebours visuel** dans l'interface ("auto-stop dans 10s... 9s... 8s...")
- **Configuration ajustable** via SILENCE_THRESHOLD et SILENCE_DURATION
- **Plus besoin de cliquer** sur "Arrêter l'enregistrement"

#### ENTER automatique après insertion
- **Simulation de la touche ENTER** après insertion du texte transcrit
- **Envoi automatique** du message (parfait pour Claude.ai, Google, etc.)
- **Événements clavier complets** (keydown, keypress, keyup)
- **Compatible** React, Vue, Angular et formulaires standards
- **Option désactivable** via le paramètre pressEnter

### 🔧 Améliorations techniques

#### popup.js v2.0.0
- Ajout AudioContext pour analyse audio en temps réel
- Ajout AnalyserNode pour détection du niveau sonore
- Calcul RMS (Root Mean Square) pour mesure précise du volume
- Intervalle de vérification toutes les 100ms
- Nettoyage propre des ressources AudioContext
- Logs détaillés pour debug (\[Whisper STT\])
- Header complet avec auteur, version, changelog
- Commentaires exhaustifs dans tout le code

#### content.js v2.0.0
- Nouvelle fonction simulateEnterKey()
- Simulation complète des événements clavier (keydown, keypress, keyup)
- Support des formulaires avec déclenchement submit si approprié
- Délai de 50ms avant simulation pour assurer insertion complète
- 3 méthodes d'insertion avec fallback automatique
- Amélioration compatibilité éditeurs React complexes
- Header complet avec versionnement
- Commentaires détaillés pour chaque fonction

### 📚 Documentation

#### README.md v2.0.0
- Documentation complète des nouvelles fonctionnalités
- Section dédiée à l'auto-stop et ENTER automatique
- Exemples d'utilisation avec Claude.ai
- Cas d'usage détaillés (conversation, dictée, recherche)
- Instructions de configuration des nouveaux paramètres
- Header avec versionnement

#### INSTALL.md v2.0.0
- Guide d'installation mis à jour
- Instructions d'utilisation du mode conversationnel v2.0.0
- Section dépannage pour auto-stop et ENTER
- Configuration du délai de silence
- Configuration de la sensibilité
- Désactivation de l'ENTER automatique si souhaité

#### CHANGELOG.md v2.0.0
- Création du fichier changelog dédié
- Historique complet de toutes les versions

### 🎨 Interface utilisateur
- Affichage du compte à rebours pendant l'enregistrement
- Message amélioré : "auto-stop dans Xs"
- Indicateur visuel de l'état (enregistrement, silence, transcription)

### 🔒 Sécurité et compatibilité
- Gestion propre des permissions AudioContext
- Nettoyage des ressources à l'arrêt
- Compatibilité maintenue avec tous les navigateurs Chromium
- Respect des restrictions de sécurité des sites (ENTER peut être bloqué sur sites protégés)

---

## Version 1.0.0 - 2025-10-31

### 🎯 Version initiale

#### Fonctionnalités de base
- **Connexion au serveur whisper.cpp** local (port 8080)
- **Enregistrement audio** via MediaRecorder API
- **Transcription** via whisper.cpp avec support de 9+ langues
- **Insertion automatique** du texte transcrit dans les champs actifs
- **Interface utilisateur** simple et intuitive

#### Composants

**manifest.json v1.0.0**
- Configuration Manifest V3 pour Brave/Chrome
- Permissions : activeTab, scripting
- Host permissions : localhost:8080
- Content scripts injectés sur toutes les pages

**popup.html v1.0.0**
- Interface popup avec design gradient violet
- Bouton "Test connexion"
- Bouton "Démarrer/Arrêter l'enregistrement"
- Sélecteur de langue (9 langues disponibles)
- Indicateur d'enregistrement animé
- Message d'information sur la confidentialité

**popup.js v1.0.0**
- Gestion de l'enregistrement audio
- Communication avec le serveur whisper
- Envoi de l'audio pour transcription
- Injection du texte dans la page via content script
- Gestion des erreurs et fallback presse-papiers

**content.js v1.0.0**
- Écoute des messages du popup
- Insertion dans input et textarea
- Insertion dans éléments contentEditable
- Recherche d'éléments éditables proches
- Déclenchement d'événements React/Vue/Angular
- Support Gmail, WhatsApp Web, formulaires standards

**start-whisper.sh v1.0.0**
- Script de démarrage automatisé du serveur whisper
- Vérification des prérequis
- Configuration des bibliothèques LD_LIBRARY_PATH
- Support du modèle large-v3 par défaut
- Option --convert pour conversion audio automatique
- Gestion du port déjà utilisé

#### Langues supportées
- Français 🇫🇷
- Anglais 🇬🇧
- Espagnol 🇪🇸
- Allemand 🇩🇪
- Italien 🇮🇹
- Portugais 🇵🇹
- Néerlandais 🇳🇱
- Arabe 🇸🇦
- Auto-détection 🌍

#### Modèles Whisper supportés
- tiny (75 MB)
- base (147 MB)
- small (487 MB)
- medium (1.5 GB)
- large-v3 (3 GB) - Recommandé

#### Documentation v1.0.0
- README.md complet
- INSTALL.md avec guide étape par étape
- Instructions de dépannage
- Exemples d'utilisation

#### Sécurité et confidentialité
- 100% local, aucune donnée envoyée en ligne
- Aucun tracking ou collecte de données
- Code open source auditable
- Manifest V3 avec permissions minimales

---

## 🔮 Roadmap future

### Fonctionnalités envisagées pour v3.0.0
- [ ] **Raccourcis clavier globaux** (ex: Ctrl+Shift+M pour démarrer/arrêter)
- [ ] **Mode dictée continue** sans limite de temps
- [ ] **Historique des transcriptions** avec recherche
- [ ] **Export des transcriptions** en TXT, JSON, CSV
- [ ] **Multi-micros** avec sélection dans l'interface
- [ ] **Réglages avancés** directement dans le popup
- [ ] **Thèmes personnalisables** (light/dark mode)
- [ ] **Statistiques d'utilisation** (nombre de transcriptions, temps total, etc.)

### Améliorations techniques envisagées
- [ ] **Background service worker** pour meilleure gestion des ressources
- [ ] **Cache des modèles** pour démarrage plus rapide
- [ ] **Support WebGPU** pour accélération matérielle
- [ ] **Compression audio** avant envoi au serveur
- [ ] **Mode hors ligne** avec stockage local temporaire

### Langues additionnelles
- [ ] Support de toutes les 99 langues de Whisper
- [ ] Détection automatique améliorée
- [ ] Support des accents régionaux

---

## 📊 Statistiques des versions

| Version | Date | Lignes de code | Fichiers | Nouvelles fonctionnalités |
|---------|------|----------------|----------|---------------------------|
| 1.0.0 | 2025-10-31 | ~800 | 7 | 5 |
| 2.0.0 | 2025-10-31 | ~1200 | 9 | +2 |

---

## 🤝 Contributions

Toutes les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

**Auteur** : Bruno DELNOZ - bruno.delnoz@protonmail.com  
**Projet** : Whisper Local STT - Extension Brave  
**Dernière mise à jour** : 2025-10-31
