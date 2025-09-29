#!/bin/bash

# First-time setup script for PocketBase
# This script helps set up PocketBase with an initial admin user

set -e

POCKETBASE_URL="${POCKETBASE_URL:-http://localhost:8090}"
ADMIN_EMAIL="${POCKETBASE_ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${POCKETBASE_ADMIN_PASSWORD:-admin123456}"

echo "🚀 First-time PocketBase Setup"
echo "============================="
echo ""
echo "📍 PocketBase URL: $POCKETBASE_URL"
echo "👤 Admin Email: $ADMIN_EMAIL"
echo ""
echo "This script will help you set up PocketBase for the first time."
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Start PocketBase manually:"
echo "   cd pocketbase && ./pocketbase serve --http=localhost:8090"
echo ""
echo "2. Open the PocketBase admin UI in your browser:"
echo "   $POCKETBASE_URL/_/"
echo ""
echo "3. Create your first admin account with:"
echo "   Email: $ADMIN_EMAIL"
echo "   Password: $ADMIN_PASSWORD"
echo ""
echo "4. Come back here and press Enter to continue..."
echo ""
read -p "Press Enter after creating the admin account..."

echo ""
echo "🔧 Setting up collections and demo data..."

# Now run the bootstrap script
if [ -f "scripts/bootstrap-collections.sh" ]; then
    ./scripts/bootstrap-collections.sh
else
    echo "❌ Bootstrap script not found!"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📊 Next steps:"
echo "   • Run './scripts/start-local.sh' to start the full development environment"
echo "   • Open http://localhost:3000 to view the application"
echo "   • Admin panel: $POCKETBASE_URL/_/"
echo ""
echo "💡 Tip: Update your .env file with the admin credentials you just created"
