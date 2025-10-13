# LoyalLink - Loyalty Program Management System

A modern, full-stack loyalty program management system built with Next.js, Supabase, and Resend.

## 🚀 Features

- **Customer Management**: Register customers and track their visits
- **QR Code System**: Generate QR codes for businesses and customers
- **Visit Tracking**: Scan QR codes to record visits and award points
- **Reward System**: Automatic reward calculation and notifications
- **Email Notifications**: Welcome emails, visit confirmations, and reward alerts
- **Dashboard**: Real-time analytics and customer insights
- **Mobile-Friendly**: Responsive design for all devices

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
git clone https://github.com/yourusername/loyallink.git
cd loyallink
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

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | Your Supabase project URL | Yes |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Supabase anonymous key | Yes |
| \`SUPABASE_SERVICE_ROLE_KEY\` | Supabase service role key | Yes |
| \`RESEND_API_KEY\` | Resend API key for emails | Yes |
| \`NEXT_PUBLIC_APP_URL\` | Your app's URL | Yes |

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

## 📱 Usage

### For Businesses:
1. Sign up and create your business profile
2. Set up your reward program (title, description, visit goal)
3. Generate your business QR code
4. Display QR code for customers to scan and join

### For Customers:
1. Scan business QR code to join loyalty program
2. Receive personal QR code via email
3. Show QR code on each visit to earn points
4. Get rewards automatically after reaching visit goal

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

For support, email support@loyallink.com or create an issue on GitHub.