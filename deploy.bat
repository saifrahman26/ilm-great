@echo off
echo 🔗 LoyalLink - Preparing for Vercel Deployment
echo ==============================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the loyalty-tracker directory.
    pause
    exit /b 1
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

REM Run type check
echo 🔍 Running type check...
npm run type-check
if errorlevel 1 (
    echo ❌ Type check failed. Please fix TypeScript errors before deploying.
    pause
    exit /b 1
)

REM Run build to check for errors
echo 🏗️  Testing build...
npm run build
if errorlevel 1 (
    echo ❌ Build failed. Please fix build errors before deploying.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Show git status
echo 📝 Current git status:
git status

set /p commit_choice="Do you want to commit and push changes? (y/n): "
if /i "%commit_choice%"=="y" (
    set /p commit_message="Enter commit message: "
    git add .
    git commit -m "%commit_message%"
    git push origin main
    echo ✅ Changes pushed to GitHub
)

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo 🎉 Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Configure environment variables in Vercel dashboard
echo 2. Update Supabase URL configuration  
echo 3. Test your deployed application
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions
pause