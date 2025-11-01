#!/bin/bash

################################################################################
# Nom du script     : start-whisper.sh
# Auteur            : Bruno DELNOZ  
# Email             : bruno.delnoz@protonmail.com
# Path complet      : /mnt/data2_78g/Security/scripts/Projects_web/braveVTTextension/start-whisper.sh
# Target usage      : Démarrage du serveur whisper.cpp pour l'extension STT
#                     avec configuration optimisée pour la rapidité
# Version           : 2.3.0
# Date              : 2025-11-01
#
# CHANGELOG:
# ----------
# v2.3.0 - 2025-11-01
#   - Changement modèle par défaut : small au lieu de medium
#   - Raison : medium trop lent (1.5GB), small plus rapide (487MB)
#   - Qualité toujours excellente pour usage quotidien
#   - Réduction temps de transcription de ~50%
# 
# v2.2.0 - 2025-10-31
#   - Changement du modèle par défaut : medium au lieu de large-v3
#   - Plus rapide et toujours bonne qualité
# 
# v2.1.0 - 2025-10-31
#   - Ajout option --whisper-path pour spécifier le chemin de whisper.cpp
#   - Path par défaut gardé si non spécifié
# 
# v2.0.0 - 2025-10-31
#   - Ajout option --listmodel pour lister les modèles disponibles
#   - Ajout option --model pour sélectionner un modèle spécifique
#   - Ajout option --test pour tester la connexion
#   - Amélioration de l'affichage des informations
#   - Support des arguments standards (--help, --exec, etc.)
# 
# v1.0.0 - 2025-10-31
#   - Script de démarrage initial
#   - Configuration des bibliothèques LD_LIBRARY_PATH
#   - Support modèle par défaut
################################################################################

################################################################################
# CONFIGURATION
################################################################################

# Chemins par défaut
DEFAULT_WHISPER_DIR="/mnt/data2_78g/Security/scripts/AI_Projects/DeepEcho_whisper/whisper.cpp"
WHISPER_DIR="$DEFAULT_WHISPER_DIR"
MODELS_DIR="$WHISPER_DIR/models"

# Configuration par défaut
DEFAULT_MODEL="ggml-small.bin"
MODEL="$DEFAULT_MODEL"
PORT=8080
HOST="127.0.0.1"

# Mode
EXEC_MODE=false
LIST_MODELS=false
TEST_CONNECTION=false

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

################################################################################
# AIDE
################################################################################

show_help() {
    cat << EOF
${CYAN}╔══════════════════════════════════════════════════════════════════════════╗
║              Whisper Server Launcher v2.3.0                              ║
║                   Bruno DELNOZ - 2025-11-01                              ║
╚══════════════════════════════════════════════════════════════════════════╝${NC}

${GREEN}DESCRIPTION:${NC}
    Démarre le serveur whisper.cpp pour l'extension Whisper Local STT

${GREEN}USAGE:${NC}
    $0 [OPTIONS]

${GREEN}OPTIONS:${NC}
    ${YELLOW}--help, -h${NC}
        Afficher cette aide

    ${YELLOW}--exec, -exe${NC}
        Démarrer le serveur whisper

    ${YELLOW}--model MODELE${NC}
        Sélectionner un modèle spécifique
        Défaut: ${DEFAULT_MODEL}
        Exemples: ggml-base.bin, ggml-medium.bin, ggml-large-v3.bin

    ${YELLOW}--whisper-path CHEMIN${NC}
        Spécifier le chemin vers whisper.cpp
        Défaut: ${DEFAULT_WHISPER_DIR}
        Exemple: /home/user/whisper.cpp

    ${YELLOW}--listmodel${NC}
        Lister tous les modèles disponibles dans $MODELS_DIR

    ${YELLOW}--test${NC}
        Tester la connexion au serveur (si déjà démarré)

    ${YELLOW}--changelog, -ch${NC}
        Afficher l'historique des versions

${GREEN}EXEMPLES:${NC}
    ${CYAN}# Lister les modèles disponibles${NC}
    $0 --listmodel

    ${CYAN}# Démarrer avec le modèle par défaut (small)${NC}
    $0 --exec

    ${CYAN}# Démarrer avec un modèle spécifique${NC}
    $0 --exec --model ggml-medium.bin

    ${CYAN}# Démarrer avec un chemin whisper personnalisé${NC}
    $0 --exec --whisper-path /home/user/whisper.cpp

    ${CYAN}# Tester la connexion${NC}
    $0 --test

${GREEN}MODÈLES WHISPER:${NC}
    tiny        (75 MB)    - Très rapide, moins précis
    base        (147 MB)   - Bon équilibre
    small       (487 MB)   - Rapide et précis (recommandé par défaut)
    medium      (1.5 GB)   - Haute qualité, plus lent
    large-v3    (3 GB)     - Meilleure qualité, très lent

${GREEN}AUTEUR:${NC}
    Bruno DELNOZ - bruno.delnoz@protonmail.com

EOF
}

################################################################################
# CHANGELOG
################################################################################

show_changelog() {
    cat << EOF
${CYAN}╔══════════════════════════════════════════════════════════════════════════╗
║                            CHANGELOG v2.3.0                              ║
╚══════════════════════════════════════════════════════════════════════════╝${NC}

${GREEN}Version 2.3.0 - 2025-11-01${NC}
    ${YELLOW}[*]${NC} Changement modèle par défaut : small au lieu de medium
    ${YELLOW}[*]${NC} Raison : medium trop lent, small plus rapide (~50% gain)
    ${YELLOW}[*]${NC} Qualité toujours excellente pour usage quotidien (487MB)
    ${YELLOW}[*]${NC} Meilleur équilibre vitesse/qualité pour transcription temps réel

${GREEN}Version 2.2.0 - 2025-10-31${NC}
    ${YELLOW}[*]${NC} Changement du modèle par défaut : medium au lieu de large-v3
    ${YELLOW}[*]${NC} Plus rapide (2-3x) et toujours excellente qualité

${GREEN}Version 2.1.0 - 2025-10-31${NC}
    ${YELLOW}[+]${NC} Ajout option --whisper-path pour spécifier le chemin de whisper.cpp
    ${YELLOW}[+]${NC} Path par défaut gardé si non spécifié: ${DEFAULT_WHISPER_DIR}

${GREEN}Version 2.0.0 - 2025-10-31${NC}
    ${YELLOW}[+]${NC} Ajout option --listmodel pour lister les modèles
    ${YELLOW}[+]${NC} Ajout option --model pour sélectionner un modèle
    ${YELLOW}[+]${NC} Ajout option --test pour tester la connexion
    ${YELLOW}[+]${NC} Amélioration affichage des informations
    ${YELLOW}[+]${NC} Support arguments standards (--help, --exec, etc.)

${GREEN}Version 1.0.0 - 2025-10-31${NC}
    ${YELLOW}[+]${NC} Script de démarrage initial
    ${YELLOW}[+]${NC} Configuration LD_LIBRARY_PATH
    ${YELLOW}[+]${NC} Support modèle par défaut

EOF
}

################################################################################
# LISTER LES MODÈLES
################################################################################

list_models() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    Modèles Whisper disponibles                           ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ ! -d "$MODELS_DIR" ]; then
        echo -e "${RED}[ERREUR]${NC} Dossier models introuvable: $MODELS_DIR"
        exit 1
    fi
    
    echo -e "${GREEN}Modèles trouvés dans:${NC} $MODELS_DIR"
    echo ""
    
    # Lister tous les fichiers .bin
    local count=0
    while IFS= read -r -d '' model_file; do
        local filename=$(basename "$model_file")
        local size=$(du -h "$model_file" | cut -f1)
        
        # Déterminer le type
        local type=""
        if [[ $filename == *"tiny"* ]]; then
            type="${YELLOW}[TINY]${NC}     - Très rapide"
        elif [[ $filename == *"base"* ]]; then
            type="${GREEN}[BASE]${NC}     - Équilibré"
        elif [[ $filename == *"small"* ]]; then
            type="${BLUE}[SMALL]${NC}    - Bon compromis"
        elif [[ $filename == *"medium"* ]]; then
            type="${CYAN}[MEDIUM]${NC}   - Haute qualité"
        elif [[ $filename == *"large"* ]]; then
            type="${GREEN}[LARGE]${NC}    - Meilleure qualité ⭐"
        else
            type="${NC}[AUTRE]${NC}"
        fi
        
        echo -e "  ${type}"
        echo -e "    Fichier: ${YELLOW}$filename${NC}"
        echo -e "    Taille:  $size"
        echo ""
        
        ((count++))
    done < <(find "$MODELS_DIR" -maxdepth 1 -name "ggml-*.bin" -type f -print0 | sort -z)
    
    if [ $count -eq 0 ]; then
        echo -e "${RED}[ERREUR]${NC} Aucun modèle trouvé dans $MODELS_DIR"
        echo -e "${YELLOW}[INFO]${NC} Téléchargez un modèle avec:"
        echo -e "  cd $WHISPER_DIR"
        echo -e "  bash ./models/download-ggml-model.sh base"
    else
        echo -e "${GREEN}Total:${NC} $count modèle(s) disponible(s)"
    fi
    
    echo ""
}

################################################################################
# TESTER LA CONNEXION
################################################################################

test_connection() {
    echo -e "${BLUE}[TEST]${NC} Test de connexion au serveur whisper..."
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://$HOST:$PORT/health 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}[OK]${NC} Serveur whisper accessible sur http://$HOST:$PORT"
        
        # Essayer de récupérer plus d'infos
        local health_info=$(curl -s http://$HOST:$PORT/health 2>/dev/null)
        if [ ! -z "$health_info" ]; then
            echo -e "${GREEN}[INFO]${NC} Réponse du serveur: $health_info"
        fi
    else
        echo -e "${RED}[ERREUR]${NC} Serveur whisper non accessible"
        echo -e "${YELLOW}[INFO]${NC} Vérifiez que le serveur est démarré avec:"
        echo -e "  $0 --exec"
    fi
}

################################################################################
# VÉRIFICATIONS
################################################################################

check_prerequisites() {
    local all_ok=true
    
    # Vérifier le dossier whisper
    if [ ! -d "$WHISPER_DIR" ]; then
        echo -e "${RED}[ERREUR]${NC} Dossier whisper.cpp introuvable: $WHISPER_DIR"
        all_ok=false
    fi
    
    # Vérifier le binaire server
    if [ ! -f "$WHISPER_DIR/build/bin/whisper-server" ]; then
        echo -e "${RED}[ERREUR]${NC} whisper-server introuvable dans build/bin/"
        all_ok=false
    fi
    
    # Vérifier le modèle
    if [ ! -f "$MODELS_DIR/$MODEL" ]; then
        echo -e "${RED}[ERREUR]${NC} Modèle introuvable: $MODELS_DIR/$MODEL"
        echo -e "${YELLOW}[INFO]${NC} Utilisez --listmodel pour voir les modèles disponibles"
        all_ok=false
    fi
    
    if [ "$all_ok" = false ]; then
        return 1
    fi
    
    return 0
}

################################################################################
# DÉMARRAGE DU SERVEUR
################################################################################

start_server() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                  Démarrage du serveur Whisper                            ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Vérifications
    if ! check_prerequisites; then
        exit 1
    fi
    
    # Vérifier si le port est déjà utilisé
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}[ATTENTION]${NC} Le port $PORT est déjà utilisé"
        echo -e "${YELLOW}[INFO]${NC} Voulez-vous arrêter le processus existant ? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}[INFO]${NC} Arrêt du processus..."
            lsof -ti:$PORT | xargs kill -9 2>/dev/null
            sleep 1
        else
            echo -e "${RED}[ANNULÉ]${NC}"
            exit 1
        fi
    fi
    
    # Afficher les infos
    echo -e "${GREEN}📍 Configuration:${NC}"
    echo -e "   Modèle:      $MODEL"
    echo -e "   URL:         http://$HOST:$PORT"
    echo -e "   Répertoire:  $WHISPER_DIR"
    echo ""
    echo -e "${YELLOW}💡 Appuyez sur Ctrl+C pour arrêter${NC}"
    echo ""
    
    # Démarrer le serveur
    cd "$WHISPER_DIR" || exit 1
    
    LD_LIBRARY_PATH=./build/src:./build/ggml/src:$LD_LIBRARY_PATH \
    ./build/bin/whisper-server \
        -m "models/$MODEL" \
        --port $PORT \
        --host $HOST \
        --convert
}

################################################################################
# PARSING DES ARGUMENTS
################################################################################

if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --changelog|-ch)
            show_changelog
            exit 0
            ;;
        --exec|-exe)
            EXEC_MODE=true
            shift
            ;;
        --model)
            MODEL="$2"
            shift 2
            ;;
        --whisper-path)
            WHISPER_DIR="$2"
            MODELS_DIR="$WHISPER_DIR/models"
            shift 2
            ;;
        --listmodel)
            LIST_MODELS=true
            shift
            ;;
        --test)
            TEST_CONNECTION=true
            shift
            ;;
        *)
            echo -e "${RED}[ERREUR]${NC} Option inconnue: $1"
            echo "Utilisez --help pour voir l'aide"
            exit 1
            ;;
    esac
done

################################################################################
# EXÉCUTION
################################################################################

if [ "$LIST_MODELS" = true ]; then
    list_models
    exit 0
fi

if [ "$TEST_CONNECTION" = true ]; then
    test_connection
    exit 0
fi

if [ "$EXEC_MODE" = true ]; then
    start_server
else
    echo -e "${RED}[ERREUR]${NC} Utilisez --exec pour démarrer le serveur"
    echo "Utilisez --help pour voir l'aide"
    exit 1
fi
