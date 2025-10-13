# 🚀 LoyalLink Vercel Deployment Guide

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Your code should be in a GitHub repository
3. **Supabase Project** - Set up at [supabase.com](https://supabase.com)
4. **Resend Account** - For email functionality at [resend.com](https://resend.com)

## 🔧 Environment Variables Setup

You'll need to configure these environment variables in Vercel:

### Required Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

## 📋 Step-by-Step Deployment

### 1. **Prepare Your Repository**

```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. **Deploy to Vercel**

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd loyalty-tracker
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: loyallink (or your preferred name)
# - Directory: ./
# - Override settings? No
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `loyalty-tracker` folder as root directory
5. Configure environment variables (see below)
6. Click "Deploy"

### 3. **Configure Environment Variables in Vercel**

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add each environment variable:

```bash
# Add these one by one:
NEXT_PUBLIC_SUPABASE_URL = your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
RESEND_API_KEY = your_resend_api_key
NEXT_PUBLIC_APP_URL = https://your-deployed-url.vercel.app
```

### 4. **Update Supabase Configuration**

After deployment, update your Supabase project:

1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: 
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/dashboard`

### 5. **Test Your Deployment**

Visit your deployed URL and test:
- ✅ User registration and login
- ✅ QR code generation and email sending
- ✅ Customer management
- ✅ Scanner functionality

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to your main branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically deploys!
```

## 🛠️ Troubleshooting

### Common Issues:

#### 1. **Build Errors**
```bash
# Check build locally first
npm run build
npm run start
```

#### 2. **Environment Variables Not Working**
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

#### 3. **Supabase Connection Issues**
- Verify Supabase URLs and keys
- Check RLS policies are properly configured
- Ensure service role key has proper permissions

#### 4. **Email Not Sending**
- Verify Resend API key is correct
- Check Resend domain verification
- Test email functionality locally first

### 5. **Custom Domain (Optional)**

To use a custom domain:

1. Go to **Settings** → **Domains** in Vercel
2. Add your domain
3. Configure DNS records as shown
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## 📊 Performance Optimization

Your Vercel deployment includes:

- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Edge Functions** for API routes
- ✅ **Automatic Image Optimization**
- ✅ **Gzip Compression**

## 🔐 Security Checklist

Before going live:

- [ ] All environment variables are secure
- [ ] Supabase RLS policies are properly configured
- [ ] API routes have proper validation
- [ ] Email templates don't expose sensitive data
- [ ] CORS settings are configured correctly

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review Supabase logs
3. Test API endpoints individually
4. Verify environment variables

## 🎉 Success!

Once deployed, your LoyalLink application will be live at:
`https://your-app-name.vercel.app`

Share this URL with your users to start building customer loyalty! 🔗✨