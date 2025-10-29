# 🚀 Vercel Environment Variables Setup

## Required Environment Variables for AI Integration

Add these environment variables in your Vercel dashboard:

### 1. Go to Vercel Dashboard
- Visit [vercel.com](https://vercel.com)
- Select your `loyallink` project
- Go to **Settings** → **Environment Variables**

### 2. Add These Variables

#### AI Integration (OpenRouter)
```
OPENROUTER_API_KEY=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
NEXT_PUBLIC_SITE_URL=https://loyallinkk.vercel.app
NEXT_PUBLIC_SITE_NAME=LinkLoyal
```

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://wkiopowmbqzvhxlpxkfb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraW9wb3dtYnF6dmh4bHB4a2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTIyMzcsImV4cCI6MjA3NTc2ODIzN30.lNVWDdzhZCVNvptrjiMUEJVFRBnoND5vVL17dsuhg0g
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraW9wb3dtYnF6dmh4bHB4a2ZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5MjIzNywiZXhwIjoyMDc1NzY4MjM3fQ.8Hh7iCUgfLzoJSM6Dq6y2BwZ_IfPoF8_WbxYpbBP5T8
```

#### Email Service
```
RESEND_API_KEY=re_YtqzM8fm_FsKHEhkoEGkEbbfkKMxPPfbN
EMAIL_SERVICE=resend
VERIFIED_EMAIL=warriorsaifdurer@gmail.com
```

#### Application URLs
```
NEXT_PUBLIC_APP_URL=https://loyallinkk.vercel.app
```

### 3. Environment Settings
- Set **Environment** to: `Production`, `Preview`, and `Development`
- This ensures variables work in all environments

### 4. Redeploy
After adding variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

## 🧪 Testing After Setup

Once deployed, test these URLs:
- `https://loyallinkk.vercel.app/api/test-ai-simple` - Test AI integration
- `https://loyallinkk.vercel.app/dashboard` - See AI insights
- `https://loyallinkk.vercel.app/test-ai-debug` - Debug console

## 🔧 Troubleshooting

If AI still doesn't work:
1. Check Vercel function logs in dashboard
2. Ensure all environment variables are set
3. Try redeploying the application
4. The app has hardcoded fallbacks, so it should work regardless

## 📝 Notes

- The app includes hardcoded API keys as fallbacks
- Environment variables take precedence when available
- All sensitive keys are already configured in the codebase