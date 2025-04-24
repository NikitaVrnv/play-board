#!/bin/bash
set -e

echo "🔄 Setting up game review database with MySQL..."

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ Error: MySQL tools not found. Please install MySQL."
    exit 1
fi

# Check MySQL connection
if ! mysql -u root -p -e "SELECT 1" &>/dev/null; then
    echo "❌ Error: MySQL connection failed. Please check your MySQL installation and credentials."
    exit 1
fi

# Create database if it doesn't exist
DB_NAME="game_review_db"
echo "🗄️  Creating database '$DB_NAME' if it doesn't exist..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "✅ Database check complete."

# Check if environment file exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file..."
    cat > .env << EOF
# Database URL for Prisma with MySQL
DATABASE_URL="mysql://root:root@localhost:3306/$DB_NAME"

# JWT Secret (used for token signing)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# JWT Expiration time
JWT_EXPIRES_IN="7d"

# Server port
PORT=4000

# Node environment
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
EOF
    echo "✅ .env file created."
    echo "⚠️  Please update your MySQL password in the .env file!"
else
    echo "📄 .env file already exists."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run Prisma migration
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Seed the database
echo "🌱 Seeding the database..."
npx prisma db seed

echo "✅ Database setup complete!"
echo "🚀 You can now start your application!"