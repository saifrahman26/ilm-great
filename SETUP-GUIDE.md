# Loyalty Tracker Setup Guide

## Current Status
Your loyalty tracker application is almost ready! Here's what needs to be done:

## ✅ Completed
- ✅ Removed all demo/mock data
- ✅ Real email integration with Resend
- ✅ Enhanced signup and login pages
- ✅ Visit tracking system
- ✅ Reward management
- ✅ Beautiful email templates
- ✅ Dashboard analytics
- ✅ Customer management

## 🔧 Required Setup Steps

### 1. Run Database Update Script
Run this SQL in your Supabase SQL Editor to create the new tables:

```sql
-- File: supabase-update.sql
-- This creates visits, rewards, and business_settings tables
```

### 2. Fix RLS Policies (IMPORTANT!)
The signup is failing because of Row Level Security. Run this SQL:

```sql
-- File: fix-signup-rls.sql
-- This fixes the RLS policies to allow business creation during signup
```

### 3. Configure Resend Email
1. Go to https://resend.com
2. Verify your domain
3. Update `.env.local` with your verified domain:
   ```
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```
4. Update `src/app/api/send-message/route.ts` line 48:
   ```typescript
   from: 'noreply@yourdomain.com', // Replace with your verified domain
   ```

### 4. Test the Signup Flow
1. Go to `/signup`
2. Fill in all fields including loyalty program settings
3. Submit the form
4. Check Supabase Auth to see if user was created
5. Check businesses table to see if business was created

## 🐛 Troubleshooting

### Issue: "new row violates row-level security policy"
**Solution:** Run the `fix-signup-rls.sql` script

### Issue: 401 Unauthorized on businesses table
**Solution:** The session isn't established yet. The code now waits 500ms for session establishment.

### Issue: Email not sending
**Solution:** 
1. Verify your domain in Resend
2. Update the `from` email address in the API route
3. Check Resend dashboard for delivery logs

### Issue: Tables don't exist (visits, rewards, business_settings)
**Solution:** Run the `supabase-update.sql` script

## 📝 Features Overview

### For Business Owners:
- **Signup**: Create account with full loyalty program configuration
- **Dashboard**: View customer analytics and stats
- **Customer Management**: Add customers manually
- **Settings**: Update reward details and visit goals
- **Email Notifications**: Automatic emails for visits and rewards

### For Customers:
- **QR Code Registration**: Join loyalty program via QR scan
- **Visit Tracking**: Automatic visit recording
- **Progress Emails**: Get notified of visit progress
- **Reward Notifications**: Email when reward is earned
- **Beautiful UI**: Professional customer-facing pages

## 🚀 Next Steps

1. **Run the SQL scripts** (supabase-update.sql and fix-signup-rls.sql)
2. **Configure Resend** with your verified domain
3. **Test signup** to ensure it works
4. **Add your first customer** via /register
5. **Test QR scanning** via /scan?customer=CUSTOMER_ID
6. **Customize** the email templates and branding

## 📧 Email Templates

Three beautiful email templates are available:

1. **Visit Reminder**: Shows progress toward next reward
2. **Loyalty Points**: Celebrates points earned
3. **Simple**: General purpose messages

All templates are mobile-responsive and professionally designed.

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own business data
- Customers linked to specific businesses
- Secure authentication via Supabase Auth

## 💡 Tips

- Start with a low visit goal (3-5) to encourage engagement
- Use clear, enticing reward descriptions
- Test the email flow before going live
- Monitor the dashboard for customer insights
- Send re-engagement emails to inactive customers

## Need Help?

Check the console for specific error messages and refer to this guide for solutions.
