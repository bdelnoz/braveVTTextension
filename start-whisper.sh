#!/bin/bash

# Script de démarrage du serveur Whisper pour l'extension Brave
# Whisper Local STT

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
WHISPER_DIR="/mnt/data2_78g/Security/scripts/AI_Projects/DeepEcho_whisper/whisper.cpp"
MODEL="models/ggml-large-v3.bin"
PORT=8080
HOST="127.0.0.1"

# Vérifier si whisper.cpp existe
if [ ! -d "$WHISPER_DIR" ]; then
    echo -e "${RED}❌ Erreur: Le dossier whisper.cpp n'existe pas${NC}"
    echo "Chemin: $WHISPER_DIR"
    exit 1
fi

# Aller dans le dossier whisper
cd "$WHISPER_DIR" || exit 1

# Vérifier si le modèle existe
if [ ! -f "$MODEL" ]; then
    echo -e "${RED}❌ Erreur: Le modèle $MODEL n'existe pas${NC}"
    echo "Téléchargez-le avec: bash ./models/download-ggml-model.sh base"
    exit 1
fi

# Vérifier si le serveur existe
if [ ! -f "build/bin/whisper-server" ]; then
    echo -e "${RED}❌ Erreur: whisper-server n'est pas compilé${NC}"
    echo "Compilez-le avec: make"
    exit 1
fi

# Vérifier si le port est déjà utilisé
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Le port $PORT est déjà utilisé${NC}"
    echo -e "${YELLOW}Voulez-vous arrêter le processus existant ? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Arrêt du processus..."
        lsof -ti:$PORT | xargs kill -9 2>/dev/null
        sleep 1
    else
        echo -e "${RED}Annulé${NC}"
        exit 1
    fi
fi

# Message de démarrage
echo -e "${GREEN}🚀 Démarrage du serveur Whisper...${NC}"
echo -e "${GREEN}📍 Modèle: $MODEL${NC}"
echo -e "${GREEN}🔗 URL: http://$HOST:$PORT${NC}"
echo -e "${YELLOW}💡 Appuyez sur Ctrl+C pour arrêter${NC}"
echo ""

# Démarrer le serveur avec les bonnes bibliothèques
LD_LIBRARY_PATH=./build/src:./build/ggml/src:$LD_LIBRARY_PATH \
./build/bin/whisper-server \
    -m "$MODEL" \
    --port $PORT \
    --host $HOST \
    --convert

# Note: --convert permet de convertir automatiquement les formats audio
