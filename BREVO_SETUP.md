# Brevo Email Setup Guide

This guide will help you set up Brevo (formerly Sendinblue) for your LoyalLink email functionality.

## Why Brevo?

- ✅ **Free Tier**: 300 emails/day free forever
- ✅ **No Domain Required**: Works with any email address
- ✅ **Reliable Delivery**: High deliverability rates
- ✅ **Easy Setup**: Simple API integration
- ✅ **Professional Features**: Templates, analytics, etc.

## Step 1: Create Brevo Account

1. Go to [Brevo.com](https://www.brevo.com/)
2. Click "Sign up free"
3. Fill in your details and verify your email
4. Complete the account setup

## Step 2: Get Your API Key

1. Log into your Brevo dashboard
2. Go to **Settings** → **API Keys** (or visit [https://app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api))
3. Click **"Generate a new API key"**
4. Give it a name like "LoyalLink App"
5. Copy the generated API key (starts with `xkeysib-`)

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Email Service (Brevo API)
BREVO_API_KEY=xkeysib-your-actual-api-key-here
BREVO_SENDER_EMAIL=your-email@yourdomain.com
```

### Important Notes:

- **BREVO_API_KEY**: Your actual API key from Brevo (starts with `xkeysib-`)
- **BREVO_SENDER_EMAIL**: The email address you want emails to come from
  - Can be any email address (doesn't need to be verified for free tier)
  - Use something professional like `noreply@yourbusiness.com`
  - Or use your personal email like `hello@yourbusiness.com`

## Step 4: Deploy to Production

If you're using Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the same environment variables:
   - `BREVO_API_KEY` = your API key
   - `BREVO_SENDER_EMAIL` = your sender email

## Step 5: Test Email Functionality

1. Try registering a new customer with an email
2. Check if the QR code email is sent
3. Check your Brevo dashboard for email statistics

## Brevo Free Tier Limits

- **300 emails/day** (9,000/month)
- **Unlimited contacts**
- **Email templates**
- **Basic analytics**
- **API access**

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**
   - Make sure your API key starts with `xkeysib-`
   - Check there are no extra spaces in your `.env.local`
   - Regenerate the API key if needed

2. **"Sender email not authorized"**
   - For free tier, you can use any email as sender
   - Make sure `BREVO_SENDER_EMAIL` is set correctly

3. **Emails not being sent**
   - Check your Brevo dashboard for sending statistics
   - Verify your API key is active
   - Check the browser console for error messages

### Testing Commands:

You can test your setup by visiting these pages in your app:
- `/test-email` - Basic email test
- Customer registration with email - Real-world test

## Brevo Dashboard Features

Once set up, you can use Brevo's dashboard to:
- View email sending statistics
- Create email templates
- Manage contact lists
- Monitor delivery rates
- Set up automation (paid plans)

## Upgrading Later

If you need more emails:
- **Lite Plan**: €25/month for 20,000 emails
- **Premium Plan**: €65/month for 20,000 emails + advanced features
- **Enterprise**: Custom pricing for high volume

## Support

- Brevo Documentation: [https://developers.brevo.com/](https://developers.brevo.com/)
- Brevo Support: Available in your dashboard
- LoyalLink Issues: Check the console logs for detailed error messages