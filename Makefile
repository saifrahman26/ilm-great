# LoyalLink - Customer Loyalty Tracker
# Makefile for project setup and deployment

.PHONY: help install setup dev build deploy clean test lint format

# Default target
help:
	@echo "LoyalLink - Customer Loyalty Tracker"
	@echo "Available commands:"
	@echo ""
	@echo "  setup     - Initial project setup (install + env)"
	@echo "  install   - Install dependencies"
	@echo "  dev       - Start development server"
	@echo "  build     - Build for production"
	@echo "  start     - Start production server"
	@echo "  deploy    - Deploy to Vercel"
	@echo "  test      - Run tests"
	@echo "  lint      - Run ESLint"
	@echo "  format    - Format code with Prettier"
	@echo "  clean     - Clean build files"
	@echo "  env       - Copy environment template"
	@echo "  db-setup  - Setup Supabase database"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install

# Copy environment template
env:
	@echo "🔧 Setting up environment variables..."
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo "✅ Created .env.local from template"; \
		echo "⚠️  Please update the values in .env.local with your actual credentials"; \
	else \
		echo "⚠️  .env.local already exists"; \
	fi

# Initial project setup
setup: install env
	@echo "🚀 Project setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Update .env.local with your actual credentials"
	@echo "2. Run 'make db-setup' to setup your database"
	@echo "3. Run 'make dev' to start development"

# Start development server
dev:
	@echo "🔥 Starting development server..."
	npm run dev

# Build for production
build:
	@echo "🏗️  Building for production..."
	npm run build

# Start production server
start:
	@echo "🚀 Starting production server..."
	npm start

# Deploy to Vercel
deploy:
	@echo "🚀 Deploying to Vercel..."
	@if command -v vercel >/dev/null 2>&1; then \
		vercel --prod; \
	else \
		echo "❌ Vercel CLI not found. Install with: npm i -g vercel"; \
		exit 1; \
	fi

# Run tests
test:
	@echo "🧪 Running tests..."
	npm test

# Run ESLint
lint:
	@echo "🔍 Running ESLint..."
	npm run lint

# Format code
format:
	@echo "✨ Formatting code..."
	@if command -v prettier >/dev/null 2>&1; then \
		npx prettier --write .; \
	else \
		echo "⚠️  Prettier not found. Install with: npm install -D prettier"; \
	fi

# Clean build files
clean:
	@echo "🧹 Cleaning build files..."
	rm -rf .next
	rm -rf out
	rm -rf dist
	rm -rf node_modules/.cache

# Database setup helper
db-setup:
	@echo "🗄️  Database setup instructions:"
	@echo ""
	@echo "1. Go to https://supabase.com and create a new project"
	@echo "2. Copy the SQL from supabase-schema.sql"
	@echo "3. Run it in your Supabase SQL editor"
	@echo "4. Update your .env.local with the project URL and keys"
	@echo ""
	@echo "Your current Supabase URL: $(shell grep NEXT_PUBLIC_SUPABASE_URL .env.local 2>/dev/null || echo 'Not set')"

# Environment check
check-env:
	@echo "🔍 Checking environment variables..."
	@if [ -f .env.local ]; then \
		echo "✅ .env.local exists"; \
		if grep -q "your-app.vercel.app" .env.local; then \
			echo "⚠️  Please update NEXT_PUBLIC_APP_URL in .env.local"; \
		fi; \
		if grep -q "your-email@domain.com" .env.local; then \
			echo "⚠️  Please update VERIFIED_EMAIL in .env.local"; \
		fi; \
	else \
		echo "❌ .env.local not found. Run 'make env' first"; \
	fi

# Quick start for new developers
quickstart: setup check-env
	@echo ""
	@echo "🎉 Quick start complete!"
	@echo "Run 'make dev' to start developing"

# Production deployment checklist
deploy-check:
	@echo "📋 Pre-deployment checklist:"
	@echo ""
	@echo "Environment Variables (set these in Vercel dashboard):"
	@echo "  ✓ NEXT_PUBLIC_SUPABASE_URL"
	@echo "  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY"
	@echo "  ✓ SUPABASE_SERVICE_ROLE_KEY"
	@echo "  ✓ RESEND_API_KEY"
	@echo "  ✓ NEXT_PUBLIC_APP_URL (your domain)"
	@echo "  ✓ EMAIL_TEST_MODE=false"
	@echo "  ✓ VERIFIED_EMAIL"
	@echo ""
	@echo "Database:"
	@echo "  ✓ Supabase project created"
	@echo "  ✓ Schema applied (supabase-schema.sql)"
	@echo "  ✓ RLS policies enabled"
	@echo ""
	@echo "Ready to deploy? Run 'make deploy'"

# Show project info
info:
	@echo "📊 Project Information:"
	@echo ""
	@echo "Name: LoyalLink - Customer Loyalty Tracker"
	@echo "Framework: Next.js"
	@echo "Database: Supabase"
	@echo "Email: Resend"
	@echo "Deployment: Vercel"
	@echo ""
	@echo "Key Features:"
	@echo "  • Customer registration with QR codes"
	@echo "  • Visit tracking and loyalty points"
	@echo "  • Automated email notifications"
	@echo "  • Business dashboard"
	@echo "  • Mobile-friendly interface"