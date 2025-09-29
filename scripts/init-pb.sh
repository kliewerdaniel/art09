#!/bin/bash

# PocketBase initialization script
# Downloads the correct PocketBase binary for the current platform and sets up the pb_data directory

set -e

echo "🚀 Initializing PocketBase..."

# Detect platform
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case $PLATFORM in
    "darwin")
        PLATFORM="darwin"
        ;;
    "linux")
        PLATFORM="linux"
        ;;
    "mingw64_nt"*|"msys_nt"*)
        PLATFORM="windows"
        ;;
    *)
        echo "❌ Unsupported platform: $PLATFORM"
        exit 1
        ;;
esac

# Map architecture
case $ARCH in
    "x86_64"|"amd64")
        ARCH="amd64"
        ;;
    "aarch64"|"arm64")
        ARCH="arm64"
        ;;
    "i386"|"386")
        ARCH="386"
        ;;
    *)
        echo "❌ Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

# PocketBase version
PB_VERSION="0.22.20"
PB_FILENAME="pocketbase_${PB_VERSION}_${PLATFORM}_${ARCH}"

if [ "$PLATFORM" = "windows" ]; then
    PB_FILENAME="${PB_FILENAME}.zip"
    DOWNLOAD_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${PB_FILENAME}"
else
    PB_FILENAME="${PB_FILENAME}.zip"
    DOWNLOAD_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${PB_FILENAME}"
fi

echo "📦 Detected platform: $PLATFORM ($ARCH)"
echo "🔗 Download URL: $DOWNLOAD_URL"

# Create pocketbase directory if it doesn't exist
mkdir -p pocketbase

# Download PocketBase if not already present
if [ ! -f "pocketbase/pocketbase" ] && [ ! -f "pocketbase/pocketbase.exe" ]; then
    echo "⬇️  Downloading PocketBase..."
    curl -L -o "pocketbase/${PB_FILENAME}" "$DOWNLOAD_URL"

    echo "📁 Extracting PocketBase..."
    cd pocketbase
    if [ "$PLATFORM" = "windows" ]; then
        # For Windows, we'll keep the zip file and extract it differently
        echo "💡 On Windows, please extract pocketbase.zip manually or use the provided PowerShell script"
    else
        unzip -o "${PB_FILENAME}"
        rm "${PB_FILENAME}"
    fi
    cd ..
else
    echo "✅ PocketBase binary already exists"
fi

# Create pb_data directory if it doesn't exist
if [ ! -d "pb_data" ]; then
    echo "📁 Creating pb_data directory..."
    mkdir -p pb_data
    echo "✅ Created pb_data directory"
else
    echo "✅ pb_data directory already exists"
fi

echo "🎉 PocketBase initialization complete!"
echo ""
echo "Next steps:"
echo "1. Run './scripts/bootstrap-collections.sh' to set up sample data"
echo "2. Run './scripts/start-local.sh' to start the development environment"
echo ""
echo "💡 Tip: You can also download PocketBase manually from:"
echo "   https://github.com/pocketbase/pocketbase/releases"
