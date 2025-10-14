# Fix for "Invalid API Key" Error

## Problem
When registering new users, you're getting an "invalid API key" error. This is happening because the Resend API key in your `.env.local` file is either invalid or expired.

## Immediate Solution (Already Applied)
I've temporarily updated the registration system to use a no-email endpoint that bypasses email sending:

- **New endpoint**: `/api/register-customer-no-email`
- **Updated component**: `scan-register/page.tsx` now uses the no-email endpoint
- **Added feature**: Direct QR code viewing at `/customer-qr?id={customerId}`

## How to Fix the Email Issue Permanently

### Option 1: Get a New Resend API Key (Recommended)
1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Log in to your Resend account
3. Create a new API key
4. Replace the `RESEND_API_KEY` in your `.env.local` file
5. Restart your development server
6. Update `scan-register/page.tsx` to use `/api/register-customer` instead of `/api/register-customer-no-email`

### Option 2: Use a Different Email Service
If you prefer not to use Resend, you can:
1. Update the email sending logic in `/lib/messaging.ts`
2. Use services like SendGrid, Mailgun, or AWS SES
3. Update the environment variables accordingly

## Current Workaround Features

### 1. No-Email Registration
- Customers can register without email functionality
- All data is still saved to the database
- QR codes are generated but not emailed

### 2. Direct QR Code Access
- New page: `/customer-qr?id={customerId}`
- Customers can view and download their QR code directly
- Shows loyalty progress and business information
- Mobile-optimized design

### 3. Success Page Enhancement
- Registration success page now includes a "View Your QR Code" button
- Opens the customer's QR code in a new tab
- Provides immediate access without waiting for email

## Testing the Fix

1. Start your development server: `npm run dev`
2. Go to a registration page (e.g., `/scan-register?business={businessId}`)
3. Fill out the form and submit
4. You should see success without the "invalid API key" error
5. Click "View Your QR Code" to see the customer's QR code

## Files Modified

- `src/app/api/register-customer-no-email/route.ts` (new)
- `src/app/customer-qr/page.tsx` (new)
- `src/app/api/customer/[id]/route.ts` (new)
- `src/app/scan-register/page.tsx` (updated)
- `.env.local` (commented the API key issue)

## Next Steps

1. **Test the current fix** - Registration should work without email errors
2. **Get a new Resend API key** when you have time
3. **Switch back to email functionality** by updating the endpoint in scan-register
4. **Consider adding email as optional** rather than required for better user experience