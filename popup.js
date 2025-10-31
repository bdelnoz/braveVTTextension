/**
 * ============================================================================
 * Nom du fichier : popup.js
 * Auteur         : Bruno DELNOZ
 * Email          : bruno.delnoz@protonmail.com
 * Path complet   : /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension/popup.js
 * Target usage   : Interface popup de l'extension Whisper Local STT pour Brave
 *                  Gère l'enregistrement audio, la transcription via whisper.cpp
 *                  et l'insertion automatique du texte transcrit
 * Version        : 2.0.0
 * Date           : 2025-10-31
 * 
 * CHANGELOG:
 * -----------
 * v2.0.0 - 2025-10-31
 *   - Ajout détection de silence avec auto-stop après 10 secondes
 *   - Ajout ENTER automatique après insertion du texte transcrit
 *   - Amélioration de la détection audio avec AudioContext et AnalyserNode
 *   - Ajout timer visuel pendant l'enregistrement
 *   - Ajout header complet avec versionnement et changelog
 *   - Commentaires détaillés pour chaque section
 * 
 * v1.0.0 - 2025-10-31
 *   - Version initiale
 *   - Connexion au serveur whisper.cpp
 *   - Enregistrement audio via MediaRecorder
 *   - Transcription et insertion dans les champs de texte
 *   - Support multi-langues
 *   - Interface utilisateur avec indicateur d'enregistrement
 * ============================================================================
 */

// ============================================================================
// CONFIGURATION GLOBALE
// ============================================================================

// URL du serveur whisper.cpp local
const WHISPER_URL = 'http://127.0.0.1:8080';

// Paramètres de détection de silence
const SILENCE_THRESHOLD = 0.01;  // Seuil de volume considéré comme silence (0-1)
const SILENCE_DURATION = 10000;   // Durée de silence avant auto-stop (10 secondes)
const CHECK_INTERVAL = 100;       // Intervalle de vérification du niveau audio (ms)

// ============================================================================
// VARIABLES D'ÉTAT GLOBALES
// ============================================================================

// MediaRecorder pour capturer l'audio
let mediaRecorder = null;

// Chunks audio enregistrés
let audioChunks = [];

// État de l'enregistrement
let isRecording = false;

// AudioContext pour analyser le niveau sonore
let audioContext = null;

// AnalyserNode pour détecter le silence
let analyser = null;

// MediaStreamSource pour connecter le stream à l'analyser
let streamSource = null;

// Timer pour vérifier le silence
let silenceCheckInterval = null;

// Timestamp du dernier son détecté
let lastSoundTime = Date.now();

// ============================================================================
// RÉFÉRENCES AUX ÉLÉMENTS DOM
// ============================================================================

// Élément d'affichage du statut
const statusDiv = document.getElementById('status');

// Bouton de test de connexion
const testBtn = document.getElementById('testBtn');

// Bouton d'enregistrement
const recordBtn = document.getElementById('recordBtn');

// Sélecteur de langue
const languageSelect = document.getElementById('language');

// Indicateur visuel d'enregistrement en cours
const recordingIndicator = document.getElementById('recordingIndicator');

// ============================================================================
// INITIALISATION DE L'EXTENSION
// ============================================================================

/**
 * Initialisation au chargement du DOM
 * - Teste automatiquement la connexion au serveur whisper
 * - Configure les event listeners des boutons
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Whisper STT v2.0.0] Extension chargée');
    
    // Test de connexion automatique au démarrage
    testConnection();
    
    // Configuration des écouteurs d'événements
    testBtn.addEventListener('click', testConnection);
    recordBtn.addEventListener('click', toggleRecording);
});

// ============================================================================
// FONCTIONS DE CONNEXION AU SERVEUR WHISPER
// ============================================================================

/**
 * Teste la connexion au serveur whisper.cpp
 * Vérifie que le serveur est accessible via l'endpoint /health
 * Active le bouton d'enregistrement si la connexion est réussie
 */
async function testConnection() {
    statusDiv.textContent = '🔄 Test de connexion...';
    statusDiv.className = 'status';
    
    try {
        // Tentative de connexion à l'endpoint health du serveur whisper
        const response = await fetch(`${WHISPER_URL}/health`, {
            method: 'GET',
        });
        
        if (response.ok) {
            // Connexion réussie
            statusDiv.textContent = '✅ Connecté au serveur Whisper';
            statusDiv.className = 'status connected';
            recordBtn.disabled = false;
            console.log('[Whisper STT] Connexion au serveur réussie');
        } else {
            throw new Error('Serveur non disponible');
        }
    } catch (error) {
        // Échec de connexion
        statusDiv.textContent = '❌ Serveur Whisper non disponible';
        statusDiv.className = 'status error';
        recordBtn.disabled = true;
        console.error('[Whisper STT] Erreur de connexion:', error);
    }
}

// ============================================================================
// FONCTIONS DE GESTION DE L'ENREGISTREMENT
// ============================================================================

/**
 * Bascule entre démarrer et arrêter l'enregistrement
 * Fonction appelée par le bouton principal d'enregistrement
 */
async function toggleRecording() {
    if (!isRecording) {
        await startRecording();
    } else {
        await stopRecording();
    }
}

/**
 * Démarre l'enregistrement audio
 * - Demande l'accès au microphone
 * - Initialise le MediaRecorder
 * - Configure l'AudioContext pour la détection de silence
 * - Démarre la surveillance du niveau sonore
 */
async function startRecording() {
    try {
        console.log('[Whisper STT] Démarrage de l\'enregistrement');
        
        // Demander l'accès au microphone avec paramètres optimisés
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                channelCount: 1,      // Mono
                sampleRate: 16000,    // 16kHz optimal pour Whisper
            } 
        });
        
        // Créer le MediaRecorder pour capturer l'audio
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
        });
        
        // Réinitialiser les chunks audio
        audioChunks = [];
        
        // Gérer la réception des données audio
        mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
        });
        
        // Gérer l'arrêt de l'enregistrement
        mediaRecorder.addEventListener('stop', async () => {
            // Créer un blob avec tout l'audio enregistré
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            // Lancer la transcription
            await transcribeAudio(audioBlob);
            
            // Arrêter tous les tracks du stream
            stream.getTracks().forEach(track => track.stop());
            
            // Nettoyer l'AudioContext
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
        });
        
        // Initialiser la détection de silence
        setupSilenceDetection(stream);
        
        // Démarrer l'enregistrement
        mediaRecorder.start();
        isRecording = true;
        
        // Mettre à jour l'interface utilisateur
        recordBtn.textContent = 'Arrêter l\'enregistrement';
        recordBtn.classList.add('recording');
        recordingIndicator.classList.add('active');
        statusDiv.textContent = '🎤 Enregistrement en cours... (auto-stop après 10s de silence)';
        statusDiv.className = 'status';
        
        console.log('[Whisper STT] Enregistrement démarré avec détection de silence');
        
    } catch (error) {
        console.error('[Whisper STT] Erreur d\'accès au microphone:', error);
        statusDiv.textContent = '❌ Impossible d\'accéder au microphone';
        statusDiv.className = 'status error';
    }
}

/**
 * Configure la détection de silence
 * Utilise AudioContext et AnalyserNode pour monitorer le niveau sonore
 * @param {MediaStream} stream - Stream audio du microphone
 */
function setupSilenceDetection(stream) {
    // Créer un AudioContext pour analyser l'audio
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Créer un AnalyserNode pour obtenir les données audio
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    // Connecter le stream au analyser
    streamSource = audioContext.createMediaStreamSource(stream);
    streamSource.connect(analyser);
    
    // Buffer pour stocker les données audio
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    
    // Initialiser le timestamp du dernier son
    lastSoundTime = Date.now();
    
    // Démarrer la vérification périodique du niveau sonore
    silenceCheckInterval = setInterval(() => {
        // Obtenir les données audio actuelles
        analyser.getByteTimeDomainData(dataArray);
        
        // Calculer le niveau sonore moyen
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / bufferLength);
        
        // Vérifier si on détecte du son (au-dessus du seuil)
        if (rms > SILENCE_THRESHOLD) {
            // Son détecté, mettre à jour le timestamp
            lastSoundTime = Date.now();
        } else {
            // Silence détecté, vérifier la durée
            const silenceDuration = Date.now() - lastSoundTime;
            
            if (silenceDuration >= SILENCE_DURATION) {
                // 10 secondes de silence écoulées, arrêt automatique
                console.log('[Whisper STT] 10 secondes de silence détectées, arrêt automatique');
                stopRecording();
            } else {
                // Afficher le temps restant avant auto-stop
                const remainingSeconds = Math.ceil((SILENCE_DURATION - silenceDuration) / 1000);
                statusDiv.textContent = `🎤 Enregistrement... (auto-stop dans ${remainingSeconds}s)`;
            }
        }
    }, CHECK_INTERVAL);
}

/**
 * Arrête l'enregistrement audio
 * - Stoppe le MediaRecorder
 * - Nettoie les intervalles et timers
 * - Met à jour l'interface utilisateur
 */
async function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        console.log('[Whisper STT] Arrêt de l\'enregistrement');
        
        // Arrêter le MediaRecorder
        mediaRecorder.stop();
        isRecording = false;
        
        // Nettoyer l'intervalle de vérification du silence
        if (silenceCheckInterval) {
            clearInterval(silenceCheckInterval);
            silenceCheckInterval = null;
        }
        
        // Mettre à jour l'interface utilisateur
        recordBtn.textContent = 'Démarrer l\'enregistrement';
        recordBtn.classList.remove('recording');
        recordingIndicator.classList.remove('active');
        statusDiv.textContent = '⏳ Transcription en cours...';
        statusDiv.className = 'status';
    }
}

// ============================================================================
// FONCTIONS DE TRANSCRIPTION
// ============================================================================

/**
 * Envoie l'audio au serveur whisper pour transcription
 * Envoie ensuite le texte transcrit pour insertion dans la page
 * @param {Blob} audioBlob - Blob contenant l'audio enregistré
 */
async function transcribeAudio(audioBlob) {
    try {
        console.log('[Whisper STT] Envoi de l\'audio pour transcription');
        
        // Créer un FormData pour envoyer le fichier audio
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        
        // Ajouter la langue sélectionnée si ce n'est pas l'auto-détection
        const language = languageSelect.value;
        if (language !== 'auto') {
            formData.append('language', language);
            console.log('[Whisper STT] Langue forcée:', language);
        }
        
        // Envoyer au serveur Whisper
        const response = await fetch(`${WHISPER_URL}/inference`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Erreur serveur: ${response.status}`);
        }
        
        // Récupérer le résultat de la transcription
        const result = await response.json();
        console.log('[Whisper STT] Transcription reçue:', result);
        
        if (result.text) {
            // Insérer le texte transcrit dans le champ actif
            await insertTextIntoActivePage(result.text.trim());
            
            // Afficher le succès
            statusDiv.textContent = '✅ Transcription réussie !';
            statusDiv.className = 'status connected';
        } else {
            throw new Error('Aucun texte transcrit');
        }
        
    } catch (error) {
        console.error('[Whisper STT] Erreur de transcription:', error);
        statusDiv.textContent = '❌ Erreur de transcription';
        statusDiv.className = 'status error';
    }
}

// ============================================================================
// FONCTIONS D'INSERTION DE TEXTE
// ============================================================================

/**
 * Insère le texte transcrit dans la page active
 * Envoie le texte au content script qui gère l'insertion
 * Appuie automatiquement sur ENTER après l'insertion
 * @param {string} text - Texte à insérer
 */
async function insertTextIntoActivePage(text) {
    try {
        console.log('[Whisper STT] Insertion du texte dans la page');
        
        // Obtenir l'onglet actif
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.id) {
            throw new Error('Aucun onglet actif trouvé');
        }
        
        // Injecter le script pour insérer le texte
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (textToInsert) => {
                // Envoyer un message au content script pour insérer le texte
                window.postMessage({ 
                    type: 'WHISPER_INSERT_TEXT', 
                    text: textToInsert,
                    pressEnter: true  // Nouvelle option pour appuyer sur ENTER
                }, '*');
            },
            args: [text]
        });
        
        console.log('[Whisper STT] Texte envoyé au content script');
        
    } catch (error) {
        console.error('[Whisper STT] Erreur d\'insertion:', error);
        
        // Fallback: copier dans le presse-papiers si l'insertion échoue
        try {
            await navigator.clipboard.writeText(text);
            statusDiv.textContent = '📋 Texte copié dans le presse-papiers';
            console.log('[Whisper STT] Fallback: texte copié dans le presse-papiers');
        } catch (clipError) {
            console.error('[Whisper STT] Erreur de copie dans le presse-papiers:', clipError);
        }
    }
}
