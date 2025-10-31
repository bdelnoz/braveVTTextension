/**
 * ============================================================================
 * Nom du fichier : content.js
 * Auteur         : Bruno DELNOZ
 * Email          : bruno.delnoz@protonmail.com
 * Version        : 2.1.0
 * Date           : 2025-10-31
 * 
 * CHANGELOG:
 * -----------
 * v2.1.0 - 2025-10-31
 *   - Correction bug ENTER qui ne fonctionnait pas
 *   - Amélioration simulation ENTER avec plus d'événements
 *   - Ajout logs détaillés pour debug
 *   - Test avec form.submit() pour Claude.ai
 * 
 * v2.0.0 - 2025-10-31
 *   - Fonction simulateEnterKey
 *   - Support ENTER automatique
 *   - 3 méthodes d'insertion
 * ============================================================================
 */

// ============================================================================
// ÉCOUTEUR PRINCIPAL
// ============================================================================

window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data.type === 'WHISPER_INSERT_TEXT') {
        console.log('[Whisper STT Content] Message reçu:', event.data);
        const text = event.data.text;
        const pressEnter = event.data.pressEnter || false;
        console.log('[Whisper STT Content] pressEnter=', pressEnter);
        insertText(text, pressEnter);
    }
});

// ============================================================================
// INSERTION PRINCIPALE
// ============================================================================

function insertText(text, pressEnter = false) {
    console.log('[Whisper STT Content] Insertion:', text);
    console.log('[Whisper STT Content] PressEnter:', pressEnter);
    
    const activeElement = document.activeElement;
    
    if (!activeElement) {
        console.warn('[Whisper STT Content] Aucun élément actif');
        return;
    }
    
    // Input/Textarea
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        insertIntoInputOrTextarea(activeElement, text);
        if (pressEnter) {
            console.log('[Whisper STT Content] Appel simulateEnterKey sur input/textarea');
            simulateEnterKey(activeElement);
        }
        return;
    }
    
    // ContentEditable
    if (activeElement.isContentEditable) {
        insertIntoContentEditable(activeElement, text);
        if (pressEnter) {
            console.log('[Whisper STT Content] Appel simulateEnterKey sur contentEditable');
            simulateEnterKey(activeElement);
        }
        return;
    }
    
    // Chercher parent éditable
    const editableParent = findEditableParent(activeElement);
    if (editableParent) {
        console.log('[Whisper STT Content] Parent éditable trouvé');
        if (editableParent.isContentEditable) {
            insertIntoContentEditable(editableParent, text);
            if (pressEnter) simulateEnterKey(editableParent);
            return;
        }
    }
    
    // Chercher champ proche
    const nearestInput = findNearestInput();
    if (nearestInput) {
        console.log('[Whisper STT Content] Champ proche trouvé');
        nearestInput.focus();
        setTimeout(() => {
            if (nearestInput.tagName === 'INPUT' || nearestInput.tagName === 'TEXTAREA') {
                insertIntoInputOrTextarea(nearestInput, text);
            } else if (nearestInput.isContentEditable) {
                insertIntoContentEditable(nearestInput, text);
            }
            if (pressEnter) simulateEnterKey(nearestInput);
        }, 100);
    } else {
        console.warn('[Whisper STT Content] Aucun champ trouvé');
    }
}

// ============================================================================
// INSERTION INPUT/TEXTAREA
// ============================================================================

function insertIntoInputOrTextarea(element, text) {
    const start = element.selectionStart || 0;
    const end = element.selectionEnd || 0;
    const currentValue = element.value || '';
    
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    element.value = newValue;
    
    const newCursorPos = start + text.length;
    element.selectionStart = newCursorPos;
    element.selectionEnd = newCursorPos;
    
    triggerInputEvents(element);
    console.log('[Whisper STT Content] ✅ Texte inséré dans input/textarea');
}

// ============================================================================
// INSERTION CONTENTEDITABLE
// ============================================================================

function insertIntoContentEditable(element, text) {
    console.log('[Whisper STT Content] Insertion dans contentEditable');
    element.focus();
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    // Méthode 1: execCommand
    try {
        const success = document.execCommand('insertText', false, text);
        if (success) {
            console.log('[Whisper STT Content] ✅ execCommand réussi');
            triggerInputEvents(element);
            return;
        }
    } catch (e) {
        console.log('[Whisper STT Content] execCommand échoué:', e);
    }
    
    // Méthode 2: Insertion manuelle
    try {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        console.log('[Whisper STT Content] ✅ Insertion manuelle réussie');
        triggerInputEvents(element);
    } catch (e) {
        console.error('[Whisper STT Content] ❌ Toutes méthodes échouées:', e);
    }
}

// ============================================================================
// SIMULATION ENTER - VERSION CORRIGÉE
// ============================================================================

function simulateEnterKey(element) {
    console.log('[Whisper STT Content] ⏎ Simulation ENTER commencée');
    
    // Attendre que l'insertion soit complète
    setTimeout(() => {
        // Configuration des événements
        const eventInit = {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window
        };
        
        console.log('[Whisper STT Content] Création événements clavier');
        
        // Keydown
        const keydownEvent = new KeyboardEvent('keydown', eventInit);
        element.dispatchEvent(keydownEvent);
        console.log('[Whisper STT Content] keydown dispatché');
        
        // Keypress
        try {
            const keypressEvent = new KeyboardEvent('keypress', eventInit);
            element.dispatchEvent(keypressEvent);
            console.log('[Whisper STT Content] keypress dispatché');
        } catch (e) {
            console.log('[Whisper STT Content] keypress non supporté');
        }
        
        // Keyup
        const keyupEvent = new KeyboardEvent('keyup', eventInit);
        element.dispatchEvent(keyupEvent);
        console.log('[Whisper STT Content] keyup dispatché');
        
        // IMPORTANT: Pour Claude.ai et autres éditeurs React
        // Essayer aussi de déclencher un événement submit sur le formulaire parent
        const form = element.closest('form');
        if (form) {
            console.log('[Whisper STT Content] Formulaire trouvé, tentative submit');
            
            // Créer un événement submit
            const submitEvent = new Event('submit', { 
                bubbles: true, 
                cancelable: true 
            });
            form.dispatchEvent(submitEvent);
            console.log('[Whisper STT Content] submit dispatché sur formulaire');
        }
        
        // Pour les éditeurs qui écoutent uniquement les clics sur un bouton submit
        // Chercher un bouton submit proche
        const submitButton = findSubmitButton(element);
        if (submitButton) {
            console.log('[Whisper STT Content] Bouton submit trouvé, simulation clic');
            submitButton.click();
            console.log('[Whisper STT Content] Clic simulé sur bouton submit');
        }
        
        console.log('[Whisper STT Content] ✅ ENTER simulation terminée');
    }, 100);
}

// ============================================================================
// TROUVER BOUTON SUBMIT
// ============================================================================

function findSubmitButton(element) {
    // Chercher dans le parent form
    const form = element.closest('form');
    if (form) {
        // Chercher un bouton de type submit
        const submitBtn = form.querySelector('button[type="submit"]') || 
                         form.querySelector('input[type="submit"]') ||
                         form.querySelector('button:not([type])'); // Bouton sans type = submit par défaut
        if (submitBtn) {
            console.log('[Whisper STT Content] Bouton submit trouvé dans form');
            return submitBtn;
        }
    }
    
    // Chercher un bouton proche de l'élément (pour Claude.ai)
    const container = element.parentElement?.parentElement;
    if (container) {
        const buttons = container.querySelectorAll('button');
        for (const btn of buttons) {
            // Chercher un bouton avec texte évocateur
            const btnText = btn.textContent.toLowerCase();
            if (btnText.includes('send') || 
                btnText.includes('envoyer') || 
                btnText.includes('submit') ||
                btn.getAttribute('aria-label')?.toLowerCase().includes('send')) {
                console.log('[Whisper STT Content] Bouton send/submit trouvé:', btn);
                return btn;
            }
        }
    }
    
    console.log('[Whisper STT Content] Aucun bouton submit trouvé');
    return null;
}

// ============================================================================
// ÉVÉNEMENTS
// ============================================================================

function triggerInputEvents(element) {
    const events = [
        new Event('input', { bubbles: true, cancelable: true }),
        new Event('change', { bubbles: true, cancelable: true }),
        new KeyboardEvent('keydown', { bubbles: true }),
        new KeyboardEvent('keyup', { bubbles: true }),
        new InputEvent('beforeinput', { bubbles: true }),
        new InputEvent('input', { bubbles: true, inputType: 'insertText' })
    ];
    
    events.forEach(event => {
        try {
            element.dispatchEvent(event);
        } catch (e) {}
    });
}

// ============================================================================
// UTILITAIRES
// ============================================================================

function findEditableParent(element) {
    let current = element.parentElement;
    let depth = 0;
    while (current && depth < 10) {
        if (current.isContentEditable || 
            current.tagName === 'INPUT' || 
            current.tagName === 'TEXTAREA') {
            return current;
        }
        current = current.parentElement;
        depth++;
    }
    return null;
}

function findNearestInput() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="search"], input:not([type]), textarea');
    for (const input of inputs) {
        if (isElementVisible(input)) return input;
    }
    
    const editables = document.querySelectorAll('[contenteditable="true"]');
    for (const editable of editables) {
        if (isElementVisible(editable)) return editable;
    }
    return null;
}

function isElementVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
}

console.log('[Whisper STT Content v2.1.0] Content script chargé et prêt');
