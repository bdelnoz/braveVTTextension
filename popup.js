/**
 * ============================================================================
 * Nom du fichier : popup.js
 * Auteur         : Bruno DELNOZ
 * Email          : bruno.delnoz@protonmail.com
 * Version        : 2.1.0
 * Date           : 2025-10-31
 * 
 * CHANGELOG:
 * -----------
 * v2.1.0 - 2025-10-31
 *   - Ajout sauvegarde de la langue sélectionnée (chrome.storage.local)
 *   - Restauration automatique de la langue au démarrage
 *   - Correction bug ENTER qui ne fonctionnait pas
 *   - Amélioration des logs pour debug
 * 
 * v2.0.0 - 2025-10-31
 *   - Auto-stop après 10s de silence
 *   - ENTER automatique
 *   - Détection audio en temps réel
 * ============================================================================
 */

const WHISPER_URL = 'http://127.0.0.1:8080';
const SILENCE_THRESHOLD = 0.01;
const SILENCE_DURATION = 10000;
const CHECK_INTERVAL = 100;

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let audioContext = null;
let analyser = null;
let streamSource = null;
let silenceCheckInterval = null;
let lastSoundTime = Date.now();

const statusDiv = document.getElementById('status');
const testBtn = document.getElementById('testBtn');
const recordBtn = document.getElementById('recordBtn');
const languageSelect = document.getElementById('language');
const recordingIndicator = document.getElementById('recordingIndicator');

// ============================================================================
// SAUVEGARDE ET RESTAURATION DES PRÉFÉRENCES
// ============================================================================

/**
 * Sauvegarde la langue sélectionnée dans chrome.storage.local
 */
function saveLanguagePreference() {
    const selectedLanguage = languageSelect.value;
    chrome.storage.local.set({ selectedLanguage: selectedLanguage }, () => {
        console.log('[Whisper STT] Langue sauvegardée:', selectedLanguage);
    });
}

/**
 * Restaure la langue sauvegardée au démarrage
 */
function restoreLanguagePreference() {
    chrome.storage.local.get(['selectedLanguage'], (result) => {
        if (result.selectedLanguage) {
            languageSelect.value = result.selectedLanguage;
            console.log('[Whisper STT] Langue restaurée:', result.selectedLanguage);
        }
    });
}

// ============================================================================
// INITIALISATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Whisper STT v2.1.0] Extension chargée');
    
    // Restaurer la langue sauvegardée
    restoreLanguagePreference();
    
    // Test de connexion automatique
    testConnection();
    
    // Event listeners
    testBtn.addEventListener('click', testConnection);
    recordBtn.addEventListener('click', toggleRecording);
    
    // Sauvegarder la langue quand elle change
    languageSelect.addEventListener('change', saveLanguagePreference);
});

// ============================================================================
// CONNEXION
// ============================================================================

async function testConnection() {
    statusDiv.textContent = '🔄 Test de connexion...';
    statusDiv.className = 'status';
    
    try {
        const response = await fetch(`${WHISPER_URL}/health`, { method: 'GET' });
        
        if (response.ok) {
            statusDiv.textContent = '✅ Connecté au serveur Whisper';
            statusDiv.className = 'status connected';
            recordBtn.disabled = false;
            console.log('[Whisper STT] Connexion réussie');
        } else {
            throw new Error('Serveur non disponible');
        }
    } catch (error) {
        statusDiv.textContent = '❌ Serveur Whisper non disponible';
        statusDiv.className = 'status error';
        recordBtn.disabled = true;
        console.error('[Whisper STT] Erreur connexion:', error);
    }
}

// ============================================================================
// ENREGISTREMENT
// ============================================================================

async function toggleRecording() {
    if (!isRecording) {
        await startRecording();
    } else {
        await stopRecording();
    }
}

async function startRecording() {
    try {
        console.log('[Whisper STT] Démarrage enregistrement');
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { channelCount: 1, sampleRate: 16000 } 
        });
        
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        audioChunks = [];
        
        mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
        });
        
        mediaRecorder.addEventListener('stop', async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await transcribeAudio(audioBlob);
            stream.getTracks().forEach(track => track.stop());
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
        });
        
        setupSilenceDetection(stream);
        mediaRecorder.start();
        isRecording = true;
        
        recordBtn.textContent = 'Arrêter l\'enregistrement';
        recordBtn.classList.add('recording');
        recordingIndicator.classList.add('active');
        statusDiv.textContent = '🎤 Enregistrement... (auto-stop après 10s de silence)';
        statusDiv.className = 'status';
        
        console.log('[Whisper STT] Enregistrement démarré');
    } catch (error) {
        console.error('[Whisper STT] Erreur micro:', error);
        statusDiv.textContent = '❌ Impossible d\'accéder au microphone';
        statusDiv.className = 'status error';
    }
}

function setupSilenceDetection(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    streamSource = audioContext.createMediaStreamSource(stream);
    streamSource.connect(analyser);
    
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    lastSoundTime = Date.now();
    
    silenceCheckInterval = setInterval(() => {
        analyser.getByteTimeDomainData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / bufferLength);
        
        if (rms > SILENCE_THRESHOLD) {
            lastSoundTime = Date.now();
        } else {
            const silenceDuration = Date.now() - lastSoundTime;
            if (silenceDuration >= SILENCE_DURATION) {
                console.log('[Whisper STT] 10s de silence, auto-stop');
                stopRecording();
            } else {
                const remainingSeconds = Math.ceil((SILENCE_DURATION - silenceDuration) / 1000);
                statusDiv.textContent = `🎤 Enregistrement... (auto-stop dans ${remainingSeconds}s)`;
            }
        }
    }, CHECK_INTERVAL);
}

async function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        console.log('[Whisper STT] Arrêt enregistrement');
        mediaRecorder.stop();
        isRecording = false;
        
        if (silenceCheckInterval) {
            clearInterval(silenceCheckInterval);
            silenceCheckInterval = null;
        }
        
        recordBtn.textContent = 'Démarrer l\'enregistrement';
        recordBtn.classList.remove('recording');
        recordingIndicator.classList.remove('active');
        statusDiv.textContent = '⏳ Transcription en cours...';
        statusDiv.className = 'status';
    }
}

// ============================================================================
// TRANSCRIPTION
// ============================================================================

async function transcribeAudio(audioBlob) {
    try {
        console.log('[Whisper STT] Envoi audio pour transcription');
        
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        
        const language = languageSelect.value;
        if (language !== 'auto') {
            formData.append('language', language);
            console.log('[Whisper STT] Langue forcée:', language);
        }
        
        const response = await fetch(`${WHISPER_URL}/inference`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Erreur serveur: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('[Whisper STT] Transcription reçue:', result);
        
        if (result.text) {
            await insertTextIntoActivePage(result.text.trim());
            statusDiv.textContent = '✅ Transcription réussie !';
            statusDiv.className = 'status connected';
        } else {
            throw new Error('Aucun texte transcrit');
        }
    } catch (error) {
        console.error('[Whisper STT] Erreur transcription:', error);
        statusDiv.textContent = '❌ Erreur de transcription';
        statusDiv.className = 'status error';
    }
}

// ============================================================================
// INSERTION
// ============================================================================

async function insertTextIntoActivePage(text) {
    try {
        console.log('[Whisper STT] Insertion texte dans la page');
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.id) {
            throw new Error('Aucun onglet actif');
        }
        
        // CORRECTION DU BUG: Envoyer pressEnter séparément dans le message
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (textToInsert) => {
                console.log('[Whisper STT Popup] Envoi message avec texte et pressEnter=true');
                window.postMessage({ 
                    type: 'WHISPER_INSERT_TEXT', 
                    text: textToInsert,
                    pressEnter: true  // Cette valeur doit être lue par content.js
                }, '*');
            },
            args: [text]
        });
        
        console.log('[Whisper STT] Message envoyé au content script');
    } catch (error) {
        console.error('[Whisper STT] Erreur insertion:', error);
        try {
            await navigator.clipboard.writeText(text);
            statusDiv.textContent = '📋 Texte copié dans le presse-papiers';
            console.log('[Whisper STT] Fallback: presse-papiers');
        } catch (clipError) {
            console.error('[Whisper STT] Erreur presse-papiers:', clipError);
        }
    }
}
