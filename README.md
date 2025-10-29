# 🔗 LinkLoyal - AI-Powered Loyalty Program Platform

A modern, comprehensive loyalty program management system that helps businesses build lasting customer relationships through QR code technology, AI-enhanced communications, and seamless reward management.

> **Latest Update**: Added AI-powered inactive customer engagement system with personalized re-engagement emails and category-specific offers.
> 
> **Deployment Status**: Force triggering new deployment - All features ready for production.

## 🌟 **Key Features**

### 🎯 **For Businesses**
- **🚀 Quick Setup**: Complete loyalty program setup in under 10 minutes
- **📱 QR Code Generation**: Professional, branded QR codes for customer registration
- **📊 AI Dashboard**: Real-time insights and customer analytics with AI-powered business intelligence
- **🎁 Flexible Rewards**: Customizable visit goals and reward types with quick templates
- **⭐ Google Review Integration**: Automatic review prompts after customer registration
- **📧 Automated Communications**: AI-enhanced email campaigns with personalized content
- **👥 Customer Management**: Complete customer database with visit history and progress tracking

### 👥 **For Customers**
- **📱 Mobile-First Experience**: Optimized for smartphones and tablets
- **⚡ Quick Registration**: 1-minute signup process via QR code scan
- **📊 Progress Tracking**: Visual progress bars showing current cycle (3/5 visits, not total visits)
- **💾 QR Code Management**: Download, share, and save personal QR codes
- **🎁 Reward Notifications**: Premium emails with unique 6-digit claim tokens
- **⭐ Review Integration**: Easy Google Review prompts after registration
- **📧 Smart Emails**: AI-generated personalized communications

### 🤖 **AI-Enhanced Features**
- **📧 Personalized Emails**: AI-generated content tailored to each customer and business type
- **🎯 Smart Insights**: Business intelligence powered by customer data analysis
- **📝 Dynamic Content**: Adaptive messaging based on customer behavior and visit patterns
- **🔄 Automated Workflows**: Intelligent email sequences and timing optimization

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Email**: Resend API
- **QR Codes**: QR Server API
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/linkloyal.git
cd linkloyal
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your environment variables in \`.env.local\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## 🎯 **Recent Major Improvements**

### ✅ **Visit Count Logic Fixed**
- **Problem**: Customers with 18 total visits showed "18/5 visits" instead of current cycle
- **Solution**: Implemented modulo logic showing "3/5 visits (3 rewards earned)"
- **Impact**: Clear, consistent progress tracking across all interfaces

### 📱 **Mobile Optimization Enhanced**
- **Email Templates**: Fully responsive with mobile-first design
- **QR Code Display**: Larger, touch-friendly QR codes with better contrast
- **Button Interactions**: Improved download and share functionality
- **Progress Bars**: Enhanced visual feedback with proper scaling

### 🎫 **Reward System Perfected**
- **Unique Claim Tokens**: 6-digit codes for reward redemption
- **Premium Email Templates**: Professional reward notification emails
- **Proper Email Flow**: Visit confirmations vs reward notifications clearly separated
- **Token Validation**: Secure reward claim process

### ⭐ **Google Review Integration**
- **Automatic Prompts**: Customers see review requests after registration
- **Settings Integration**: Easy Google Review link management
- **Mobile Optimized**: Touch-friendly review buttons
- **Business Growth**: Helps collect more positive reviews

---

## 🔧 **Environment Variables**

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | Your Supabase project URL | Yes | \`https://xxx.supabase.co\` |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Supabase anonymous key | Yes | \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\` |
| \`SUPABASE_SERVICE_ROLE_KEY\` | Supabase service role key | Yes | \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\` |
| \`RESEND_API_KEY\` | Resend API key for emails | Yes | \`re_xxxxxxxxxx\` |
| \`OPENAI_API_KEY\` | OpenAI API key for AI features | Optional | \`sk-xxxxxxxxxx\` |
| \`NEXT_PUBLIC_APP_URL\` | Your app's URL | Yes | \`https://your-domain.com\` |

## 🗄️ Database Setup

1. Create a new Supabase project
2. Run the SQL schema:
   - \`supabase-schema.sql\`

## 📧 Email Configuration

1. Sign up for a Resend account
2. Get your API key
3. For production: verify your domain in Resend
4. Update the \`from\` address in email APIs

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Vercel

Make sure to add all environment variables from \`.env.example\` to your Vercel project settings.

## 📚 **Complete Documentation**

### 📖 **User Guides**
- **[🛍️ Customer Journey Guide](CUSTOMER_JOURNEY.md)**: Complete walkthrough of customer experience from QR scan to reward redemption
- **[🏢 Business Setup Guide](BUSINESS_SETUP_GUIDE.md)**: Comprehensive business onboarding and management guide
- **[🌟 Google Review Integration](GOOGLE_REVIEW_INTEGRATION.md)**: Setup guide for automatic review collection
- **[📧 Email Setup Guide](EMAIL_SETUP.md)**: Email system configuration and troubleshooting

### 🔧 **Technical Documentation**
- **[⚙️ Setup Guide](SETUP-GUIDE.md)**: Technical installation and configuration
- **[🗄️ Database Migration](MIGRATION_SCRIPT.sql)**: Database schema and setup scripts
- **[🔗 Supabase Configuration](SUPABASE_URL_FIX.md)**: Database connection troubleshooting

---

## 🚀 **Quick Start**

### 🏢 **For Businesses (10-Minute Setup)**
1. **Create Account**: Sign up at your deployment URL
2. **Business Info**: Enter name, email, phone, Google Review link
3. **Configure Rewards**: Set reward title, description, and visit goal (or use templates)
4. **Generate QR Code**: Download your branded QR code from dashboard
5. **Display QR Code**: Place at checkout, tables, entrance, or receipts
6. **Train Staff**: Show them how to scan customer QR codes for visit recording
7. **Launch**: Start collecting loyal customers immediately!

### 👥 **For Customers (1-Minute Registration)**
1. **Scan QR Code**: Use phone camera at participating business
2. **Quick Registration**: Fill out name, phone, and email (takes 1 minute)
3. **Get Personal QR Code**: Receive via email immediately
4. **Leave Review**: Optional Google Review prompt (helps business grow)
5. **Track Progress**: Watch progress toward reward (3/5 visits)
6. **Earn Rewards**: Show QR code on each visit, get unique claim codes when earned

## 🔐 Security Features

- Row Level Security (RLS) policies
- Secure authentication with Supabase
- API rate limiting
- Input validation and sanitization
- Secure password reset flow

## 🎯 Key Pages

- \`/\` - Landing page
- \`/signup\` - Business registration
- \`/login\` - Business login
- \`/dashboard\` - Business dashboard
- \`/customers\` - Customer management
- \`/scanner\` - QR code scanner
- \`/manual-visit\` - Manual visit recording
- \`/qr-code\` - Business QR code generator
- \`/settings\` - Business settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@linkloyal.com or create an issue on GitHub.