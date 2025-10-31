/**
 * ============================================================================
 * Nom du fichier : content.js
 * Auteur         : Bruno DELNOZ
 * Email          : bruno.delnoz@protonmail.com
 * Path complet   : /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension/content.js
 * Target usage   : Content script de l'extension Whisper Local STT
 *                  Gère l'insertion du texte transcrit dans les champs de la page
 *                  Compatible avec inputs, textareas et éditeurs contentEditable (React, etc.)
 * Version        : 2.0.0
 * Date           : 2025-10-31
 * 
 * CHANGELOG:
 * -----------
 * v2.0.0 - 2025-10-31
 *   - Ajout fonction pressEnter pour appuyer automatiquement sur ENTER après insertion
 *   - Amélioration de la détection d'éléments éditables pour React
 *   - Ajout de multiples méthodes de fallback pour l'insertion
 *   - Ajout header complet avec versionnement et changelog
 *   - Commentaires détaillés pour chaque fonction
 *   - Support amélioré pour Claude.ai et autres éditeurs complexes
 * 
 * v1.0.0 - 2025-10-31
 *   - Version initiale
 *   - Insertion dans input et textarea
 *   - Insertion dans contentEditable
 *   - Recherche d'éléments éditables proches
 *   - Déclenchement d'événements React
 * ============================================================================
 */

// ============================================================================
// ÉCOUTEUR D'ÉVÉNEMENTS PRINCIPAL
// ============================================================================

/**
 * Écoute les messages envoyés par le popup via window.postMessage
 * Gère uniquement les messages de type WHISPER_INSERT_TEXT
 */
window.addEventListener('message', (event) => {
    // Vérifier que le message vient bien de la même fenêtre (sécurité)
    if (event.source !== window) return;
    
    // Vérifier que c'est un message de type insertion de texte
    if (event.data.type === 'WHISPER_INSERT_TEXT') {
        console.log('[Whisper STT Content] Message reçu:', event.data);
        
        // Extraire le texte et l'option pressEnter
        const text = event.data.text;
        const pressEnter = event.data.pressEnter || false;
        
        // Insérer le texte dans l'élément actif
        insertText(text, pressEnter);
    }
});

// ============================================================================
// FONCTION PRINCIPALE D'INSERTION
// ============================================================================

/**
 * Insère le texte dans l'élément actif de la page
 * Essaie différentes méthodes selon le type d'élément
 * @param {string} text - Texte à insérer
 * @param {boolean} pressEnter - Si true, appuie sur ENTER après l'insertion
 */
function insertText(text, pressEnter = false) {
    console.log('[Whisper STT Content] Tentative d\'insertion de texte:', text);
    console.log('[Whisper STT Content] PressEnter:', pressEnter);
    
    const activeElement = document.activeElement;
    
    // Vérifier qu'un élément est actif
    if (!activeElement) {
        console.warn('[Whisper STT Content] Aucun élément actif');
        return;
    }
    
    // Gérer les inputs et textareas standards
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        insertIntoInputOrTextarea(activeElement, text);
        if (pressEnter) simulateEnterKey(activeElement);
        return;
    }
    
    // Gérer les éléments contentEditable (éditeurs riches comme Claude.ai, Gmail, etc.)
    if (activeElement.isContentEditable) {
        insertIntoContentEditable(activeElement, text);
        if (pressEnter) simulateEnterKey(activeElement);
        return;
    }
    
    // Chercher un parent éditable si l'élément actif ne l'est pas
    const editableParent = findEditableParent(activeElement);
    if (editableParent) {
        console.log('[Whisper STT Content] Parent éditable trouvé');
        if (editableParent.isContentEditable) {
            insertIntoContentEditable(editableParent, text);
            if (pressEnter) simulateEnterKey(editableParent);
            return;
        }
    }
    
    // Si aucun élément actif n'est éditable, chercher le champ le plus proche
    const nearestInput = findNearestInput();
    if (nearestInput) {
        console.log('[Whisper STT Content] Champ proche trouvé, focus et insertion');
        nearestInput.focus();
        
        // Attendre un peu que le focus soit effectif
        setTimeout(() => {
            if (nearestInput.tagName === 'INPUT' || nearestInput.tagName === 'TEXTAREA') {
                insertIntoInputOrTextarea(nearestInput, text);
            } else if (nearestInput.isContentEditable) {
                insertIntoContentEditable(nearestInput, text);
            }
            if (pressEnter) simulateEnterKey(nearestInput);
        }, 100);
    } else {
        console.warn('[Whisper STT Content] Aucun champ de saisie trouvé');
    }
}

// ============================================================================
// FONCTIONS D'INSERTION SELON LE TYPE D'ÉLÉMENT
// ============================================================================

/**
 * Insère le texte dans un input ou textarea standard
 * @param {HTMLElement} element - Élément input ou textarea
 * @param {string} text - Texte à insérer
 */
function insertIntoInputOrTextarea(element, text) {
    // Récupérer la position actuelle du curseur
    const start = element.selectionStart || 0;
    const end = element.selectionEnd || 0;
    const currentValue = element.value || '';
    
    // Insérer le texte à la position du curseur
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    element.value = newValue;
    
    // Repositionner le curseur après le texte inséré
    const newCursorPos = start + text.length;
    element.selectionStart = newCursorPos;
    element.selectionEnd = newCursorPos;
    
    // Déclencher tous les événements pour que React/Vue/Angular détectent le changement
    triggerInputEvents(element);
    
    console.log('[Whisper STT Content] ✅ Texte inséré dans input/textarea');
}

/**
 * Insère le texte dans un élément contentEditable (méthode optimisée pour React)
 * Utilise document.execCommand qui fonctionne bien avec les éditeurs modernes
 * @param {HTMLElement} element - Élément contentEditable
 * @param {string} text - Texte à insérer
 */
function insertIntoContentEditable(element, text) {
    console.log('[Whisper STT Content] Insertion dans contentEditable');
    
    // S'assurer que l'élément a le focus
    element.focus();
    
    // S'assurer qu'il y a une sélection active
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false); // Placer le curseur à la fin
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    // Méthode 1 : document.execCommand (fonctionne bien avec React)
    try {
        const success = document.execCommand('insertText', false, text);
        if (success) {
            console.log('[Whisper STT Content] ✅ Texte inséré avec execCommand');
            triggerInputEvents(element);
            return;
        }
    } catch (e) {
        console.log('[Whisper STT Content] execCommand échoué, essai méthode alternative');
    }
    
    // Méthode 2 : Insertion manuelle de node texte si execCommand échoue
    try {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        
        // Déplacer le curseur après le texte inséré
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        console.log('[Whisper STT Content] ✅ Texte inséré manuellement');
        triggerInputEvents(element);
        return;
    } catch (e) {
        console.error('[Whisper STT Content] ❌ Erreur d\'insertion:', e);
    }
    
    // Méthode 3 : Dernier recours - ajouter à la fin du contenu
    try {
        const currentText = element.textContent || '';
        element.textContent = currentText + text;
        
        // Mettre le curseur à la fin
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        triggerInputEvents(element);
        console.log('[Whisper STT Content] ⚠️ Texte ajouté à la fin (méthode de secours)');
    } catch (e) {
        console.error('[Whisper STT Content] ❌ Toutes les méthodes d\'insertion ont échoué');
    }
}

// ============================================================================
// FONCTION DE SIMULATION DE LA TOUCHE ENTER
// ============================================================================

/**
 * Simule l'appui sur la touche ENTER
 * Déclenche tous les événements clavier nécessaires
 * @param {HTMLElement} element - Élément sur lequel simuler ENTER
 */
function simulateEnterKey(element) {
    console.log('[Whisper STT Content] Simulation de la touche ENTER');
    
    // Attendre un petit délai pour que l'insertion soit complète
    setTimeout(() => {
        // Créer les événements clavier pour ENTER
        const keyboardEventInit = {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
            composed: true
        };
        
        // Déclencher keydown
        const keydownEvent = new KeyboardEvent('keydown', keyboardEventInit);
        element.dispatchEvent(keydownEvent);
        
        // Déclencher keypress (obsolète mais parfois nécessaire)
        try {
            const keypressEvent = new KeyboardEvent('keypress', keyboardEventInit);
            element.dispatchEvent(keypressEvent);
        } catch (e) {
            // KeyPress peut ne pas être supporté, on continue
        }
        
        // Déclencher keyup
        const keyupEvent = new KeyboardEvent('keyup', keyboardEventInit);
        element.dispatchEvent(keyupEvent);
        
        // Pour les formulaires, déclencher aussi submit si c'est approprié
        const form = element.closest('form');
        if (form && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
            // Ne déclencher submit que si c'est un input de type text/search
            if (element.tagName === 'INPUT' && 
                ['text', 'search', 'email', 'url'].includes(element.type)) {
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(submitEvent);
            }
        }
        
        console.log('[Whisper STT Content] ✅ ENTER simulé');
    }, 50);
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Déclenche tous les événements nécessaires pour que React/Vue/Angular détectent le changement
 * @param {HTMLElement} element - Élément qui a reçu l'insertion
 */
function triggerInputEvents(element) {
    // Liste de tous les événements à déclencher
    const events = [
        new Event('input', { bubbles: true, cancelable: true }),
        new Event('change', { bubbles: true, cancelable: true }),
        new KeyboardEvent('keydown', { bubbles: true, cancelable: true }),
        new KeyboardEvent('keyup', { bubbles: true, cancelable: true }),
        new InputEvent('beforeinput', { bubbles: true, cancelable: true }),
        new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText' })
    ];
    
    // Déclencher tous les événements
    events.forEach(event => {
        try {
            element.dispatchEvent(event);
        } catch (e) {
            // Certains événements peuvent échouer, on continue
        }
    });
    
    // Hack spécial pour React - forcer la détection du changement
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
    )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
    )?.set;
    
    if (nativeInputValueSetter) {
        try {
            const event = new Event('input', { bubbles: true });
            element.dispatchEvent(event);
        } catch (e) {
            // Ignore
        }
    }
}

/**
 * Trouve un parent éditable de l'élément donné
 * Remonte l'arbre DOM jusqu'à 10 niveaux
 * @param {HTMLElement} element - Élément de départ
 * @returns {HTMLElement|null} Parent éditable trouvé ou null
 */
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

/**
 * Trouve le champ de saisie visible le plus proche
 * @returns {HTMLElement|null} Champ trouvé ou null
 */
function findNearestInput() {
    // Essayer de trouver un input ou textarea visible
    const inputs = document.querySelectorAll('input[type="text"], input[type="search"], input[type="email"], input:not([type]), textarea');
    
    for (const input of inputs) {
        if (isElementVisible(input)) {
            return input;
        }
    }
    
    // Chercher des éléments contentEditable
    const editables = document.querySelectorAll('[contenteditable="true"]');
    for (const editable of editables) {
        if (isElementVisible(editable)) {
            return editable;
        }
    }
    
    return null;
}

/**
 * Vérifie si un élément est visible à l'écran
 * @param {HTMLElement} element - Élément à vérifier
 * @returns {boolean} true si visible, false sinon
 */
function isElementVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
}

// ============================================================================
// INITIALISATION
// ============================================================================

console.log('[Whisper STT Content v2.0.0] Content script chargé et prêt');
