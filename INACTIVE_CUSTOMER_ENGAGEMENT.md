# Inactive Customer Engagement System

## Overview
Automated AI-powered system to re-engage inactive customers with personalized emails and offers based on business type and customer behavior.

## Features

### 🎯 **Smart Inactive Detection**
- **Configurable Thresholds**: 7-90 days based on business type
- **Category Defaults**: 
  - Cafes/Gyms: 7 days (high frequency)
  - Restaurants/Pharmacy: 14 days (regular)
  - Salons/Beauty: 21 days (service-based)
  - Retail/Fashion: 30 days (shopping cycles)
  - Electronics: 45 days (considered purchases)
  - Jewelry: 60 days (luxury items)
  - Automotive: 90 days (seasonal services)

### 🤖 **AI-Powered Personalization**
- **Custom Messages**: Business owners can write their own messages
- **AI Generation**: Automatic personalized messages when custom message is empty
- **Dynamic Offers**: Category-specific offers (20% off, BOGO, free items)
- **Personal Touch**: Uses customer name, visit history, and business context

### 📧 **Email System**
- **Professional Templates**: Mobile-responsive HTML emails
- **Progress Tracking**: Shows customer's loyalty program progress
- **Clear CTAs**: Encourages return visits with specific offers
- **Branding**: Includes business name, contact info, and colors

### ⚙️ **Settings & Control**
- **Enable/Disable**: Toggle inactive emails on/off
- **Custom Periods**: Set inactive threshold per business needs
- **Message Editor**: Write custom messages or use AI generation
- **Preview**: See how emails will look before sending

## Implementation

### Database Schema
```sql
-- New columns in businesses table
ALTER TABLE businesses ADD COLUMN inactive_days_threshold INTEGER DEFAULT 14;
ALTER TABLE businesses ADD COLUMN inactive_customer_message TEXT;
ALTER TABLE businesses ADD COLUMN enable_inactive_emails BOOLEAN DEFAULT true;

-- Email tracking table
CREATE TABLE inactive_email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    business_id UUID REFERENCES businesses(id),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_type TEXT DEFAULT 'inactive_reminder'
);
```

### API Endpoints

#### 1. Generate AI Message
**POST** `/api/generate-inactive-message`
```json
{
  "businessName": "Coffee Corner",
  "businessCategory": "cafe",
  "rewardTitle": "Free Coffee",
  "visitGoal": 5
}
```

#### 2. Send Inactive Emails
**POST** `/api/send-inactive-emails`
- Processes all businesses with inactive emails enabled
- Finds customers past their inactive threshold
- Sends personalized re-engagement emails
- Tracks sent emails to avoid duplicates

### Settings UI Components

#### Inactive Customer Engagement Card
- **Toggle Switch**: Enable/disable feature
- **Threshold Selector**: Choose inactive period (7-90 days)
- **Message Editor**: Custom message with AI generation button
- **Preview**: Shows how email will appear
- **Tips**: Best practices for engagement

## Category-Specific Offers

### Food & Beverage
- **Cafes**: 20% off coffee, BOGO drinks, free pastries
- **Restaurants**: 15% off meals, free appetizers, complimentary desserts
- **Bakeries**: 25% off pastries, free coffee with purchase

### Services
- **Salons**: 20% off services, free treatments, product discounts
- **Beauty Parlors**: 25% off facials, free threading, package deals
- **Gyms**: Free training sessions, membership discounts, guest passes

### Retail
- **Fashion**: 30% off items, buy-2-get-1 deals, styling consultations
- **Electronics**: 15% off accessories, free warranties, gadget discounts
- **Jewelry**: 20% off fine jewelry, free cleaning, custom design discounts

## AI Message Generation

### Prompt Engineering
The AI generates messages using:
- **Business Context**: Name, type, location
- **Customer Data**: Name, visit history, loyalty progress
- **Offer Integration**: Category-specific deals
- **Tone Guidelines**: Warm, personal, not pushy

### Example AI Prompt
```
Generate a warm, personalized re-engagement email for Sarah, 
an inactive customer of "Bella's Salon" (hair salon).

Customer: Sarah, last visit 25 days ago, 3 total visits
Business: Bella's Salon, reward after 5 visits
Offer: 20% off next service

Create 150-200 words that:
- Address Sarah personally
- Mention she's missed and valued  
- Include the 20% off offer
- Reference her 3 visits positively
- Create gentle urgency to return
- End with warm call-to-action
```

## Automation & Scheduling

### Manual Trigger
- Business owners can manually trigger inactive emails
- Useful for testing and immediate campaigns

### Automated Scheduling (Future)
- Daily/weekly cron jobs to check for inactive customers
- Configurable sending times (business hours)
- Rate limiting to avoid spam

### Email Tracking
- Log all sent emails to prevent duplicates
- Track open rates and click-through rates
- Measure re-engagement success

## User Experience

### Business Owner Flow
1. **Setup**: Configure inactive threshold in settings
2. **Customize**: Write custom message or use AI generation
3. **Preview**: See how emails will look
4. **Enable**: Turn on inactive email system
5. **Monitor**: Track results and adjust settings

### Customer Experience
1. **Receive Email**: Personalized message with their name
2. **See Progress**: Current loyalty program status
3. **Get Offer**: Specific discount or incentive
4. **Easy Return**: Clear call-to-action to visit again

## Benefits

### For Businesses
- **Recover Lost Customers**: Bring back inactive customers
- **Increase Revenue**: More visits = more sales
- **Automate Marketing**: Set-and-forget engagement system
- **Personalized Touch**: AI creates unique messages for each customer
- **Data-Driven**: Category-specific offers based on business type

### For Customers
- **Feel Valued**: Personal messages show they're missed
- **Get Rewards**: Exclusive offers for returning
- **Track Progress**: See loyalty program advancement
- **Convenient**: Email reminders about favorite businesses

## Best Practices

### Message Writing
- Keep it personal and warm
- Include specific offers or incentives
- Reference their visit history
- Create gentle urgency without being pushy
- End with clear call-to-action

### Timing
- Don't send too frequently (respect the threshold)
- Consider business hours for sending
- Seasonal timing for relevant offers

### Offers
- Make offers valuable but sustainable
- Match offers to business category
- Consider customer's visit frequency
- Include expiration dates for urgency

## Testing

### Manual Testing
1. Create test customer with old last_visit date
2. Configure business with short inactive threshold
3. Generate AI message and preview
4. Send test email and verify delivery
5. Check email formatting on mobile/desktop

### API Testing
```bash
# Test AI message generation
curl -X POST /api/generate-inactive-message \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test Cafe","businessCategory":"cafe"}'

# Test email sending (admin only)
curl -X POST /api/send-inactive-emails
```

## Deployment

### Prerequisites
1. Run database migration: `ADD_INACTIVE_CUSTOMER_MIGRATION.sql`
2. Ensure AI service is configured
3. Email service (Resend) is set up
4. Environment variables are configured

### Configuration
- Set default inactive thresholds per category
- Configure email templates and styling
- Set up monitoring and logging
- Test with small customer base first

### Monitoring
- Track email delivery rates
- Monitor customer re-engagement
- Measure ROI of inactive campaigns
- Adjust thresholds based on results

The inactive customer engagement system is now ready to help businesses automatically re-engage their customers with personalized, AI-powered messages! 🚀