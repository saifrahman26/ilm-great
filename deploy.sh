#!/bin/bash

# 🚀 LoyalLink Deployment Script for Vercel

echo "🔗 LoyalLink - Preparing for Vercel Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the loyalty-tracker directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Run type check
echo "🔍 Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type check failed. Please fix TypeScript errors before deploying."
    exit 1
fi

# Run build to check for errors
echo "🏗️  Testing build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Commit any pending changes
echo "📝 Committing changes..."
git add .
git status

read -p "Do you want to commit and push changes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter commit message: " commit_message
    git commit -m "$commit_message"
    git push origin main
    echo "✅ Changes pushed to GitHub"
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Update Supabase URL configuration"
echo "3. Test your deployed application"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"