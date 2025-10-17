# Test Email After Registration

## Issue
Customers are being registered successfully but not receiving QR code emails.

## Test Steps

1. **Test Resend API directly:**
```javascript
fetch('/api/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'warriorsaifdurer@gmail.com',
        subject: 'Test Email',
        message: 'This is a test email',
        template: 'simple'
    })
})
.then(r => r.json())
.then(data => console.log('Email Test:', data))
```

2. **Check if registration is calling email function:**
- Registration API should call `sendQRCodeToCustomer()` after creating customer
- Check Vercel logs for email sending errors

## Required Environment Variables in Vercel

Make sure these are set in Vercel:
- `RESEND_API_KEY` = re_YtqzM8fm_FsKHEhkoEGkEbbfkKMxPPfbN
- `SUPABASE_SERVICE_ROLE_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- `NEXT_PUBLIC_APP_URL` = https://loyallinkk.vercel.app

## Possible Issues

1. **Email sending fails silently** - Registration API catches email errors and continues
2. **Resend API key not in Vercel** - Check environment variables
3. **Email template has errors** - Check email-templates.ts
4. **Base URL issue** - Email API might not be reachable from registration API

## Quick Fix

The registration API should log email sending status. Check Vercel logs after registration to see if email is being attempted.