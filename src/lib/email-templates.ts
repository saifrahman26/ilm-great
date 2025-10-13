interface EmailTemplateProps {
    customerName?: string
    points?: number
    totalPoints?: number
    message: string
    businessName?: string
    logoUrl?: string
}

export function getLoyaltyEmailTemplate({
    customerName = 'Valued Customer',
    points,
    totalPoints,
    message,
    businessName = 'LoyalLink Business',
    logoUrl
}: EmailTemplateProps): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            font-size: 18px;
            opacity: 0.95;
            font-weight: 500;
        }
        .loyallink-brand {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            display: inline-block;
            padding: 15px 25px;
            border-radius: 50px;
            margin-bottom: 20px;
            border: 2px solid rgba(255,255,255,0.2);
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 1px;
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
                margin: 0;
                box-shadow: none;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .points-earned {
                font-size: 36px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="loyallink-brand">
                🔗 LoyalLink
            </div>
            <h1>🎉 ${businessName}</h1>
            <p class="subtitle">Loyalty Program Update</p>
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
                <a href="#" class="cta-button">View My Account</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>${businessName}</strong></p>
            <p>Thank you for being a loyal customer!</p>
            <div class="social-links">
                <a href="#">📧 Contact Us</a>
                <a href="#">🌐 Website</a>
                <a href="#">📱 App</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px; font-weight: 600;">
                Powered by <strong>🔗 LoyalLink</strong> - Making loyalty simple and rewarding
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
    businessName = 'LoyalLink Business',
    message
}: {
    customerName?: string
    currentVisits: number
    visitGoal: number
    businessName?: string
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
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
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
        }
        .progress-fill {
            background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
            height: 100%;
            width: ${progressPercentage}%;
            border-radius: 25px;
            transition: width 0.3s ease;
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
        @media (max-width: 600px) {
            .visit-stats {
                flex-direction: column;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="loyallink-brand">
                🔗 LoyalLink
            </div>
            <h1>🎯 ${businessName}</h1>
            <p>Visit Progress Update</p>
        </div>
        
        <div class="content">
            <div style="font-size: 18px; color: #333; margin-bottom: 20px;">
                Hello ${customerName}! 👋
            </div>
            
            <div class="progress-card">
                <h3 style="margin: 0 0 15px 0; color: #2196F3;">Your Progress</h3>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
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
            <p><strong>${businessName}</strong></p>
            <p>Thank you for your loyalty!</p>
            <p style="font-size: 14px; color: #666; margin-top: 15px; font-weight: 600;">
                Powered by <strong>🔗 LoyalLink</strong> - Making loyalty simple and rewarding
            </p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

export function getRewardCompletionTemplate({
    customerName = 'Valued Customer',
    businessName = 'LoyalLink Business',
    rewardTitle,
    rewardDescription,
    visitsCompleted,
    visitGoal
}: {
    customerName?: string
    businessName?: string
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
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            font-size: 18px;
            opacity: 0.9;
        }
        .loyallink-brand {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            display: inline-block;
            padding: 15px 25px;
            border-radius: 50px;
            margin-bottom: 20px;
            border: 2px solid rgba(255,255,255,0.2);
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 1px;
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
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #ff6b6b;
            animation: confetti-fall 3s linear infinite;
        }
        @keyframes confetti-fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                box-shadow: none;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .reward-title {
                font-size: 24px;
            }
            .visit-number {
                font-size: 36px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="loyallink-brand">
                🔗 LoyalLink
            </div>
            <h1>🎉 CONGRATULATIONS!</h1>
            <p class="subtitle">You've Earned Your Reward!</p>
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
            <p><strong>${businessName}</strong></p>
            <p>🏪 We appreciate your loyalty and look forward to seeing you again!</p>
            <p style="font-size: 14px; color: #666; margin-top: 15px; font-weight: 600;">
                Powered by <strong>🔗 LoyalLink</strong> - Making loyalty simple and rewarding
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

export function getSimpleEmailTemplate(message: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message from LoyalLink</title>
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">📧 Message for You</h1>
        </div>
        <div class="content">
            ${message}
        </div>
        <div class="footer">
            <p>Thank you for being a valued customer!</p>
        </div>
    </div>
</body>
</html>
  `.trim()
}