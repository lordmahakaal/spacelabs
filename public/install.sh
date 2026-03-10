#!/bin/bash

set -e

INSTALL_SCRIPT_VERSION="1.0.0"
INSTALL_DIR="${HOME}/.spacelabs"
BIN_DIR="${HOME}/.local/bin"
SITE_URL="https://spacelabs.pro"

echo "🚀 Spacelabs Installer v${INSTALL_SCRIPT_VERSION}"
echo "================================================"
echo ""

if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️  Spacelabs is already installed."
    read -p "Do you want to reinstall? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborting."
        exit 0
    fi
    rm -rf "$INSTALL_DIR"
fi

echo "📦 Creating installation directory..."
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"

echo "🔗 Downloading CLI..."
curl -sL "${SITE_URL}/downloads/spacelabs-cli" -o "${INSTALL_DIR}/spacelabs"

echo "🔐 Making executable..."
chmod +x "${INSTALL_DIR}/spacelabs"

echo "📁 Adding to PATH..."
if [ -f "${HOME}/.bashrc" ]; then
    echo "export PATH=\"${BIN_DIR}:\$PATH\"" >> "${HOME}/.bashrc"
fi
if [ -f "${HOME}/.zshrc" ]; then
    echo "export PATH=\"${BIN_DIR}:\$PATH\"" >> "${HOME}/.zshrc"
fi

ln -sf "${INSTALL_DIR}/spacelabs" "${BIN_DIR}/spacelabs"

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Usage:"
echo "   spacelabs --help"
echo "   spacelabs run gpt"
echo "   spacelabs run grok"
echo "   spacelabs workflow agent.yaml"
echo ""
echo "🌐 Visit: ${SITE_URL}"
echo ""

read -p "Run 'spacelabs --help' now? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    "${BIN_DIR}/spacelabs" --help
fi
