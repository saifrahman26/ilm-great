interface EmailTemplateProps {
    customerName?: string
    points?: number
    totalPoints?: number
    message: string
    businessName?: string
    businessPhone?: string
    logoUrl?: string
}

export function getLoyaltyEmailTemplate({
    customerName = 'Valued Customer',
    points,
    totalPoints,
    message,
    businessName = 'LinkLoyal Business',
    businessPhone = '',
    logoUrl
}: EmailTemplateProps): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>Loyalty Program Update</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 100px;
            height: 100px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            opacity: 0.5;
        }
        .business-name {
            font-size: 36px;
            font-weight: 900;
            margin: 0 0 10px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            letter-spacing: 1px;
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            font-size: 18px;
            opacity: 0.95;
            font-weight: 500;
        }
        .linkloyal-brand {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 25px;
            margin-top: 10px;
            border: 1px solid rgba(255,255,255,0.2);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }
        .points-card {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
        }
        .points-earned {
            font-size: 48px;
            font-weight: bold;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .points-label {
            font-size: 16px;
            margin: 5px 0;
            opacity: 0.9;
        }
        .total-points {
            font-size: 14px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            opacity: 0.8;
        }
        .message {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin: 25px 0;
            font-size: 16px;
            color: #555;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #6c757d;
            font-size: 14px;
        }
        .business-contact {
            font-size: 18px;
            font-weight: 700;
            color: #333;
            margin-bottom: 10px;
        }
        .business-phone {
            font-size: 16px;
            color: #667eea;
            font-weight: 600;
            margin: 10px 0;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0 !important;
                box-shadow: none !important;
                width: 100% !important;
            }
            .header, .content, .footer {
                padding: 15px !important;
            }
            .header {
                padding: 20px 15px !important;
            }
            .business-name {
                font-size: 24px !important;
            }
            .header .subtitle {
                font-size: 16px !important;
            }
            .linkloyal-brand {
                font-size: 12px !important;
                padding: 6px 12px !important;
                margin-top: 8px !important;
            }
            .points-earned {
                font-size: 36px !important;
            }
            .points-card {
                padding: 20px !important;
                margin: 20px 0 !important;
            }
            .message {
                padding: 15px !important;
                font-size: 14px !important;
            }
            .cta-button {
                padding: 12px 25px !important;
                font-size: 14px !important;
            }
            .greeting {
                font-size: 16px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="business-name">🎉 ${businessName}</h1>
            <p class="subtitle">Loyalty Program Update</p>
            <div class="linkloyal-brand">
                🔗 LinkLoyal
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello ${customerName}! 👋
            </div>
            
            ${points ? `
            <div class="points-card">
                <div class="points-earned">+${points}</div>
                <div class="points-label">Points Earned!</div>
                ${totalPoints ? `<div class="total-points">Total Points: ${totalPoints}</div>` : ''}
            </div>
            ` : ''}
            
            <div class="message">
                ${message}
            </div>
            
            <div style="text-align: center;">
                <div style="margin: 30px 0;">
                    <h3 style="color: #333; margin-bottom: 15px;">📱 Quick Check-In</h3>
                    <p style="color: #666; margin-bottom: 20px;">Show this QR code at your next visit:</p>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://loyallinkk.vercel.app/customer-qr?name=${encodeURIComponent(customerName)}&business=${businessName}`)}" 
                         alt="Customer QR Code" 
                         style="border: 3px solid #667eea; border-radius: 12px; padding: 10px; background: white;" />
                    <p style="color: #666; font-size: 14px; margin-top: 15px;">
                        Or visit: <a href="https://loyallinkk.vercel.app/customer-qr" style="color: #667eea;">loyallinkk.vercel.app/customer-qr</a>
                    </p>
                </div>
                <a href="https://loyallinkk.vercel.app/customer-qr" class="cta-button">View My Account</a>
            </div>
        </div>
        
        <div class="footer">
            <p class="business-contact">${businessName}</p>
            ${businessPhone ? `<p class="business-phone">📞 ${businessPhone}</p>` : ''}
            <p>Thank you for being a loyal customer!</p>
            <div class="social-links">
                <a href="#">📧 Contact Us</a>
                <a href="#">🌐 Website</a>
                <a href="#">📱 App</a>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 15px; font-weight: 600;">
                Powered by <strong>🔗 LinkLoyal</strong> - Making loyalty simple and rewarding
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                You received this email because you're part of our loyalty program.
            </p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

export function getVisitReminderTemplate({
    customerName = 'Valued Customer',
    currentVisits,
    visitGoal,
    businessName = 'LinkLoyal Business',
    businessPhone = '',
    message
}: {
    customerName?: string
    currentVisits: number
    visitGoal: number
    businessName?: string
    businessPhone?: string
    message: string
}): string {
    const visitsLeft = visitGoal - currentVisits
    const progressPercentage = Math.min((currentVisits / visitGoal) * 100, 100)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>Visit Progress Update</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .business-name {
            font-size: 32px;
            font-weight: 900;
            margin: 0 0 10px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .linkloyal-brand {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 25px;
            margin-top: 10px;
            border: 1px solid rgba(255,255,255,0.2);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .progress-card {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            border: 2px solid #2196F3;
        }
        .progress-bar {
            background-color: #e0e0e0;
            border-radius: 25px;
            height: 20px;
            margin: 20px 0;
            overflow: hidden;
            position: relative;
            width: 100%;
            min-width: 200px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        .progress-fill {
            background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
            height: 100%;
            width: ${progressPercentage}%;
            border-radius: 25px;
            transition: width 0.3s ease;
            position: relative;
            min-width: ${progressPercentage > 0 ? '20px' : '0'};
            display: block;
        }
        .progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
            font-weight: bold;
            color: #333;
            text-shadow: 0 1px 2px rgba(255,255,255,0.8);
            z-index: 2;
        }
        .visit-stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
        }
        .stat {
            text-align: center;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #2196F3;
        }
        .stat-label {
            font-size: 14px;
            color: #666;
        }
        .message {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #4CAF50;
            margin: 25px 0;
            font-size: 16px;
            color: #555;
        }
        .reward-preview {
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .business-contact {
            font-size: 18px;
            font-weight: 700;
            color: #333;
            margin-bottom: 10px;
        }
        .business-phone {
            font-size: 16px;
            color: #4CAF50;
            font-weight: 600;
            margin: 10px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0 !important;
                box-shadow: none !important;
                width: 100% !important;
            }
            .header, .content, .footer {
                padding: 15px !important;
            }
            .header {
                padding: 20px 15px !important;
            }
            .business-name {
                font-size: 24px !important;
            }
            .linkloyal-brand {
                font-size: 12px !important;
                padding: 6px 12px !important;
                margin-top: 8px !important;
            }
            .progress-card {
                padding: 20px !important;
                margin: 20px 0 !important;
            }
            .progress-bar {
                height: 16px !important;
                margin: 15px 0 !important;
            }
            .visit-stats {
                flex-direction: column !important;
                gap: 10px !important;
            }
            .stat {
                margin: 5px 0 !important;
            }
            .stat-number {
                font-size: 24px !important;
            }
            .stat-label {
                font-size: 12px !important;
            }
            .message {
                padding: 15px !important;
                font-size: 14px !important;
            }
            .reward-preview {
                padding: 15px !important;
                margin: 15px 0 !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="business-name">🎯 ${businessName}</h1>
            <p>Visit Progress Update</p>
            <div class="linkloyal-brand">
                🔗 LinkLoyal
            </div>
        </div>
        
        <div class="content">
            <div style="font-size: 18px; color: #333; margin-bottom: 20px;">
                Hello ${customerName}! 👋
            </div>
            
            <div class="progress-card">
                <h3 style="margin: 0 0 15px 0; color: #2196F3;">Your Progress</h3>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                    <div class="progress-text">${Math.round(progressPercentage)}%</div>
                </div>
                <div class="visit-stats">
                    <div class="stat">
                        <div class="stat-number">${currentVisits}</div>
                        <div class="stat-label">Visits</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${visitGoal}</div>
                        <div class="stat-label">Goal</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${visitsLeft}</div>
                        <div class="stat-label">To Go</div>
                    </div>
                </div>
            </div>
            
            ${currentVisits >= visitGoal ? `
            <div class="reward-preview">
                <h3 style="margin: 0;">🎉 Congratulations!</h3>
                <p style="margin: 10px 0;">You've reached your goal! Your reward is ready!</p>
            </div>
            ` : `
            <div class="reward-preview">
                <h3 style="margin: 0;">🎁 Almost There!</h3>
                <p style="margin: 10px 0;">Just ${visitsLeft} more visit${visitsLeft === 1 ? '' : 's'} to earn your reward!</p>
            </div>
            `}
            
            <div class="message">
                ${message}
            </div>
        </div>
        
        <div class="footer">
            <p class="business-contact">${businessName}</p>
            ${businessPhone ? `<p class="business-phone">📞 ${businessPhone}</p>` : ''}
            <p>Thank you for your loyalty!</p>
            <p style="font-size: 12px; color: #666; margin-top: 15px; font-weight: 600;">
                Powered by <strong>🔗 LinkLoyal</strong> - Making loyalty simple and rewarding
            </p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

export function getRewardCompletionTemplate({
    customerName = 'Valued Customer',
    businessName = 'LinkLoyal Business',
    businessPhone = '',
    rewardTitle,
    rewardDescription,
    visitsCompleted,
    visitGoal
}: {
    customerName?: string
    businessName?: string
    businessPhone?: string
    rewardTitle: string
    rewardDescription: string
    visitsCompleted: number
    visitGoal: number
}): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>🎉 Reward Earned!</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '🎉';
            position: absolute;
            font-size: 100px;
            opacity: 0.1;
            top: -20px;
            right: -20px;
        }
        .business-name {
            font-size: 32px;
            font-weight: 900;
            margin: 0 0 10px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            font-size: 18px;
            opacity: 0.9;
        }
        .linkloyal-brand {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 25px;
            margin-top: 10px;
            border: 1px solid rgba(255,255,255,0.2);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .celebration-banner {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin: 30px 0;
            border: 3px solid #ff6b6b;
            position: relative;
        }
        .celebration-banner::before {
            content: '🏆';
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 10px;
            border-radius: 50%;
            font-size: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .reward-title {
            font-size: 28px;
            font-weight: bold;
            color: #d63031;
            margin: 20px 0 10px 0;
        }
        .reward-description {
            font-size: 18px;
            color: #2d3436;
            margin: 15px 0;
            line-height: 1.5;
        }
        .visit-achievement {
            background: linear-gradient(135deg, #a8e6cf 0%, #7fcdcd 100%);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 25px 0;
            border: 2px solid #00b894;
        }
        .visit-number {
            font-size: 48px;
            font-weight: bold;
            color: #00b894;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .visit-label {
            font-size: 16px;
            color: #2d3436;
            margin: 5px 0;
        }
        .claim-section {
            background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            color: white;
        }
        .claim-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 15px 0;
        }
        .claim-instructions {
            font-size: 16px;
            margin: 15px 0;
            line-height: 1.5;
        }
        .claim-button {
            display: inline-block;
            background: white;
            color: #fd79a8;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s ease;
        }
        .claim-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #6c757d;
            font-size: 14px;
        }
        .business-contact {
            font-size: 18px;
            font-weight: 700;
            color: #333;
            margin-bottom: 10px;
        }
        .business-phone {
            font-size: 16px;
            color: #ff6b6b;
            font-weight: 600;
            margin: 10px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0 !important;
                box-shadow: none !important;
                width: 100% !important;
            }
            .header, .content, .footer {
                padding: 15px !important;
            }
            .header {
                padding: 20px 15px !important;
            }
            .business-name {
                font-size: 24px !important;
            }
            .header .subtitle {
                font-size: 16px !important;
            }
            .linkloyal-brand {
                font-size: 12px !important;
                padding: 6px 12px !important;
                margin-top: 8px !important;
            }
            .reward-title {
                font-size: 20px !important;
            }
            .reward-description {
                font-size: 16px !important;
            }
            .visit-number {
                font-size: 32px !important;
            }
            .visit-label {
                font-size: 14px !important;
            }
            .celebration-banner {
                padding: 20px !important;
                margin: 20px 0 !important;
            }
            .visit-achievement {
                padding: 20px !important;
                margin: 20px 0 !important;
            }
            .claim-section {
                padding: 20px !important;
                margin: 20px 0 !important;
            }
            .claim-title {
                font-size: 20px !important;
            }
            .claim-instructions {
                font-size: 14px !important;
            }
            .claim-button {
                padding: 12px 25px !important;
                font-size: 14px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="business-name">🎉 ${businessName}</h1>
            <p class="subtitle">CONGRATULATIONS! You've Earned Your Reward!</p>
            <div class="linkloyal-brand">
                🔗 LinkLoyal
            </div>
        </div>
        
        <div class="content">
            <div style="font-size: 20px; color: #333; margin-bottom: 20px; text-align: center;">
                Hello ${customerName}! 🎊
            </div>
            
            <div class="celebration-banner">
                <div class="reward-title">${rewardTitle}</div>
                <div class="reward-description">${rewardDescription}</div>
            </div>
            
            <div class="visit-achievement">
                <div class="visit-number">${visitsCompleted}</div>
                <div class="visit-label">Visits Completed!</div>
                <p style="margin: 10px 0; color: #00b894; font-weight: bold;">
                    🎯 Goal: ${visitGoal} visits ✅
                </p>
            </div>
            
            <div class="claim-section">
                <div class="claim-title">🎁 How to Claim Your Reward</div>
                <div class="claim-instructions">
                    Show this email to any staff member at ${businessName} to claim your reward!
                    <br><br>
                    <strong>Valid for your next visit</strong>
                </div>
                <a href="#" class="claim-button">📱 Save This Email</a>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; color: #2d3436;">
                    Thank you for being such a loyal customer! 💝
                </p>
                <p style="font-size: 16px; color: #636e72;">
                    Keep visiting to earn more rewards!
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p class="business-contact">${businessName}</p>
            ${businessPhone ? `<p class="business-phone">📞 ${businessPhone}</p>` : ''}
            <p>🏪 We appreciate your loyalty and look forward to seeing you again!</p>
            <p style="font-size: 12px; color: #666; margin-top: 15px; font-weight: 600;">
                Powered by <strong>🔗 LinkLoyal</strong> - Making loyalty simple and rewarding
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                This reward email was generated automatically when you completed ${visitGoal} visits.
            </p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

export function getSimpleEmailTemplate(message: string, businessName: string = 'LinkLoyal Business', businessPhone: string = ''): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>Message from ${businessName}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .business-name {
            font-size: 28px;
            font-weight: 900;
            margin: 0 0 10px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .linkloyal-brand {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            margin-top: 8px;
            border: 1px solid rgba(255,255,255,0.2);
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
            font-size: 16px;
            color: #333;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
        }
        .business-contact {
            font-size: 16px;
            font-weight: 700;
            color: #333;
            margin-bottom: 8px;
        }
        .business-phone {
            font-size: 14px;
            color: #667eea;
            font-weight: 600;
            margin: 8px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0 !important;
                border-radius: 0 !important;
                width: 100% !important;
            }
            .header, .content, .footer {
                padding: 15px !important;
            }
            .business-name {
                font-size: 20px !important;
            }
            .linkloyal-brand {
                font-size: 10px !important;
                padding: 4px 8px !important;
            }
            .content {
                font-size: 14px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="business-name">📧 ${businessName}</h1>
            <div class="linkloyal-brand">
                🔗 LinkLoyal
            </div>
        </div>
        <div class="content">
            ${message}
        </div>
        <div class="footer">
            <p class="business-contact">${businessName}</p>
            ${businessPhone ? `<p class="business-phone">📞 ${businessPhone}</p>` : ''}
            <p>Thank you for being a valued customer!</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px; font-weight: 600;">
                Powered by <strong>🔗 LinkLoyal</strong> - Making loyalty simple and rewarding
            </p>
        </div>
    </div>
</body>
</html>
  `.trim()
}