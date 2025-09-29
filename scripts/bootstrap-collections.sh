#!/bin/bash

# PocketBase collections bootstrap script
# Sets up sample collections and demo data for the local-first SaaS boilerplate

set -e

POCKETBASE_URL="${POCKETBASE_URL:-http://localhost:8090}"
ADMIN_EMAIL="${POCKETBASE_ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${POCKETBASE_ADMIN_PASSWORD:-admin123456}"

echo "🔧 Bootstrapping PocketBase collections..."
echo "📍 PocketBase URL: $POCKETBASE_URL"

# Function to check if PocketBase is running
check_pocketbase() {
    if curl -s "$POCKETBASE_URL/api/health" > /dev/null; then
        return 0
    else
        echo "❌ PocketBase is not running at $POCKETBASE_URL"
        echo "💡 Please start PocketBase first:"
        echo "   cd pocketbase && ./pocketbase serve --http=localhost:8090"
        echo "   Or run: ./scripts/start-local.sh"
        return 1
    fi
}

# Function to authenticate as admin
authenticate_admin() {
    echo "🔐 Authenticating as admin..."

    # First try to create the admin user (for first-time setup)
    CREATE_ADMIN_RESPONSE=$(curl -s -X POST "$POCKETBASE_URL/api/admins" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\", \"passwordConfirm\": \"$ADMIN_PASSWORD\"}")

    # Try to authenticate
    AUTH_RESPONSE=$(curl -s -X POST "$POCKETBASE_URL/api/admins/auth-with-password" \
        -H "Content-Type: application/json" \
        -d "{\"identity\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

    TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

    if [ -z "$TOKEN" ]; then
        echo "❌ Failed to authenticate as admin"
        echo "💡 First-time setup: Please create an admin user manually in PocketBase admin UI"
        echo "   1. Visit: $POCKETBASE_URL/_/"
        echo "   2. Create an admin account"
        echo "   3. Update POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in .env"
        echo "   4. Run this script again"
        return 1
    fi

    echo "✅ Admin authenticated successfully"
}

# Function to create a collection
create_collection() {
    local collection_name="$1"
    local schema_file="$2"

    echo "📋 Creating collection: $collection_name"

    # Create collection
    CREATE_RESPONSE=$(curl -s -X POST "$POCKETBASE_URL/api/collections" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d @"$schema_file")

    if echo "$CREATE_RESPONSE" | grep -q '"id":'; then
        echo "✅ Collection '$collection_name' created successfully"
    else
        echo "❌ Failed to create collection '$collection_name'"
        echo "Response: $CREATE_RESPONSE"
    fi
}

# Function to seed demo data
seed_demo_data() {
    local collection_name="$1"
    local data_file="$2"

    echo "🌱 Seeding demo data for: $collection_name"

    # Read and post each record from the data file
    while IFS= read -r record; do
        if [ -n "$record" ] && [ "$record" != "[" ] && [ "$record" != "]" ]; then
            # Remove trailing comma if present
            record=$(echo "$record" | sed 's/,$//')

            CREATE_RESPONSE=$(curl -s -X POST "$POCKETBASE_URL/api/collections/$collection_name/records" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $TOKEN" \
                -d "$record")

            if echo "$CREATE_RESPONSE" | grep -q '"id":'; then
                echo "  ✅ Record created"
            else
                echo "  ❌ Failed to create record: $CREATE_RESPONSE"
            fi
        fi
    done < "$data_file"
}

# Check if PocketBase is running
check_pocketbase || exit 1

# Authenticate as admin
authenticate_admin || exit 1

echo ""
echo "🚀 Setting up collections..."

# Create users collection
create_collection "users" "scripts/schemas/users.json"

# Create subscriptions collection
create_collection "subscriptions" "scripts/schemas/subscriptions.json"

# Create llm_jobs collection
create_collection "llm_jobs" "scripts/schemas/llm_jobs.json"

# Create invoices collection
create_collection "invoices" "scripts/schemas/invoices.json"

echo ""
echo "🌱 Seeding demo data..."

# Seed demo users
seed_demo_data "users" "scripts/data/users.json"

# Seed demo subscriptions
seed_demo_data "subscriptions" "scripts/data/subscriptions.json"

# Seed demo LLM jobs
seed_demo_data "llm_jobs" "scripts/data/llm_jobs.json"

# Seed demo invoices
seed_demo_data "invoices" "scripts/data/invoices.json"

echo ""
echo "🎉 PocketBase bootstrap complete!"
echo ""
echo "📊 Summary:"
echo "   • 4 collections created"
echo "   • Demo data seeded"
echo "   • Admin panel available at: $POCKETBASE_URL/_/"
echo ""
echo "💡 Next steps:"
echo "   • Visit the admin panel to explore the data"
echo "   • Run './scripts/start-local.sh' to start the full development environment"
echo "   • Open http://localhost:3000 to view the application"
