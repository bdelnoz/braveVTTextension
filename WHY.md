<!--
Document : WHY.md
Auteur : Bruno DELNOZ
Email : bruno.delnoz@protonmail.com
Version : v1.0.0
Date : 2026-04-20 00:00
-->
# WHY - Whisper Local STT (Brave Extension)

## Purpose
This repository provides a browser extension workflow for fully local speech-to-text input using a locally running `whisper.cpp` server.

## Why local STT
- Privacy-first operation (no mandatory cloud API).
- Reduced external dependency risk during daily use.
- Practical voice-first workflows for chat, search, forms, and editors.

## Why this architecture
- `popup.js`: handles recording, silence detection, server communication, and user feedback.
- `content.js`: handles robust insertion into page targets and optional Enter simulation.
- `start-whisper.sh`: centralizes safe server startup and model selection.
- `install.sh`: allows scripted parameterization of extension defaults.

## Non-goals
- Replacing Whisper model internals.
- Providing remote-hosted transcription.

## Documentation scope note
This file is intentionally focused on rationale and design intent. Setup and usage details are maintained in `INSTALL.md` and `README.md`.
