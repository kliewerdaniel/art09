#!/bin/bash

# Development environment startup script
# Starts PocketBase and Next.js development server

set -e

echo "🚀 Starting Local-First SaaS Development Environment..."
echo ""

# Check if PocketBase is already running
POCKETBASE_URL="${POCKETBASE_URL:-http://localhost:8090}"

check_pocketbase_running() {
    if curl -s "$POCKETBASE_URL/api/health" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start PocketBase
start_pocketbase() {
    echo "📦 Starting PocketBase..."

    # Check if PocketBase binary exists
    if [ ! -f "pocketbase/pocketbase" ] && [ ! -f "pocketbase/pocketbase.exe" ]; then
        echo "❌ PocketBase binary not found!"
        echo "💡 Please run the following first:"
        echo "   ./scripts/init-pb.sh"
        exit 1
    fi

    # Check if pb_data directory exists
    if [ ! -d "pb_data" ]; then
        echo "❌ pb_data directory not found!"
        echo "💡 Please run the following first:"
        echo "   ./scripts/init-pb.sh"
        exit 1
    fi

    # Start PocketBase in background if not already running
    if check_pocketbase_running; then
        echo "✅ PocketBase is already running"
    else
        echo "🔄 Starting PocketBase server..."
        cd pocketbase

        # Start PocketBase with data directory
        nohup ./pocketbase serve --http="localhost:8090" --dir="../pb_data" > ../pb_data/pocketbase.log 2>&1 &
        PB_PID=$!

        cd ..

        echo "✅ PocketBase started (PID: $PB_PID)"
        echo "📝 Logs: pb_data/pocketbase.log"

        # Wait for PocketBase to be ready
        echo "⏳ Waiting for PocketBase to be ready..."
        for i in {1..30}; do
            if check_pocketbase_running; then
                break
            fi
            sleep 1
        done

        if ! check_pocketbase_running; then
            echo "❌ PocketBase failed to start properly"
            echo "💡 Check the logs: pb_data/pocketbase.log"
            exit 1
        fi

        echo "✅ PocketBase is ready!"
    fi
}

# Function to bootstrap collections if needed
bootstrap_collections() {
    echo "🔧 Checking collections..."

    # Check if collections exist
    if ! curl -s "$POCKETBASE_URL/api/collections" | grep -q "users"; then
        echo "📋 Collections not found, bootstrapping..."
        if [ -f "scripts/bootstrap-collections.sh" ]; then
            ./scripts/bootstrap-collections.sh
        else
            echo "⚠️  Bootstrap script not found, skipping collection setup"
        fi
    else
        echo "✅ Collections already exist"
    fi
}

# Function to start Next.js development server
start_nextjs() {
    echo "⚡ Starting Next.js development server..."

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "❌ Dependencies not installed!"
        echo "💡 Please run the following first:"
        echo "   npm install"
        exit 1
    fi

    # Start Next.js in development mode
    npm run dev
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development environment..."

    # Kill PocketBase if we started it
    if [ ! -z "$PB_PID" ] && kill -0 $PB_PID 2>/dev/null; then
        echo "🔄 Stopping PocketBase (PID: $PB_PID)..."
        kill $PB_PID
    fi

    echo "✅ Shutdown complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start PocketBase
start_pocketbase

# Bootstrap collections
bootstrap_collections

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📊 Services:"
echo "   • Next.js: http://localhost:3000"
echo "   • PocketBase: $POCKETBASE_URL"
echo "   • Admin Panel: $POCKETBASE_URL/_/"
echo ""
echo "💡 Useful commands:"
echo "   • View PocketBase logs: tail -f pb_data/pocketbase.log"
echo "   • Restart PocketBase: kill $PB_PID && ./scripts/start-local.sh"
echo "   • Stop all: Ctrl+C"
echo ""

# Start Next.js (this will run in foreground)
start_nextjs
