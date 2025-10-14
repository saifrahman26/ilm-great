# Fix Supabase Email Confirmation URLs

## Problem
Supabase is sending localhost URLs in confirmation emails instead of your production domain.

## Solution

### Step 1: Configure Supabase Auth Settings

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `wkiopowmbqzvhxlpxkfb`

2. **Navigate to Authentication Settings**
   - Click "Authentication" in the sidebar
   - Click "Settings" tab
   - Look for "Site URL" and "Redirect URLs"

3. **Update Site URL**
   - Set **Site URL** to: `https://loyallinkk.vercel.app`
   - This is the main URL Supabase will use for redirects

4. **Add Redirect URLs**
   Add these URLs to the **Redirect URLs** list:
   ```
   https://loyallinkk.vercel.app/auth/callback
   https://loyallinkk.vercel.app/login
   https://loyallinkk.vercel.app/dashboard
   http://localhost:3000/auth/callback
   http://localhost:3000/login
   http://localhost:3000/dashboard
   ```

### Step 2: Update Environment Variables

For **Production** (Vercel):
```env
NEXT_PUBLIC_APP_URL=https://loyallinkk.vercel.app
```

For **Development** (Local):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Create Auth Callback Handler

Create this file if it doesn't exist: `src/app/auth/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after successful confirmation
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

### Step 4: Test the Fix

1. **For Development:**
   - Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`
   - Run `npm run dev`
   - Test signup - emails should have localhost links

2. **For Production:**
   - Set `NEXT_PUBLIC_APP_URL=https://loyallinkk.vercel.app`
   - Deploy to Vercel
   - Test signup - emails should have production links

### Step 5: Deploy to Vercel

Make sure your Vercel environment variables match:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wkiopowmbqzvhxlpxkfb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://loyallinkk.vercel.app
RESEND_API_KEY=re_Av5Bex4A_ELRnvxu4r9bAf9BhV7j26bqA
EMAIL_TEST_MODE=false
VERIFIED_EMAIL=warriorsaifdurer@gmail.com
```

## Quick Fix for Right Now

If you want to test locally right now:

1. ✅ **Already done**: Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`
2. **Run your dev server**: `npm run dev`
3. **Test signup** - confirmation emails will have localhost links
4. **Click the localhost link** to confirm your account

## For Production Deployment

1. **Update Supabase settings** (steps above)
2. **Set production URL**: `NEXT_PUBLIC_APP_URL=https://loyallinkk.vercel.app`
3. **Deploy to Vercel**
4. **Test with production domain**

The key is making sure Supabase knows which domain to use for email links!