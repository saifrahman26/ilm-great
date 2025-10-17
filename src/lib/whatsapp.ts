// WhatsApp messaging service using Green API (free tier: 3000 messages/month)

interface WhatsAppMessage {
    phone: string
    message: string
    customerName?: string
    businessName?: string
}

interface LoyaltyWhatsAppMessage extends WhatsAppMessage {
    points?: number
    totalPoints?: number
    currentVisits?: number
    visitGoal?: number
}

export class WhatsAppService {
    private instanceId: string
    private accessToken: string
    private baseUrl: string

    constructor() {
        this.instanceId = process.env.WHATSAPP_INSTANCE_ID || ''
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || ''
        this.baseUrl = `https://api.green-api.com/waInstance${this.instanceId}`
    }

    private formatPhone(phone: string): string {
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '')

        // Add country code if missing (assuming US/Canada)
        if (cleaned.length === 10) {
            return `1${cleaned}`
        }

        // Remove leading + if present
        return cleaned.startsWith('1') ? cleaned : `1${cleaned}`
    }

    async sendMessage(data: WhatsAppMessage): Promise<any> {
        try {
            const formattedPhone = this.formatPhone(data.phone)

            const response = await fetch(`${this.baseUrl}/sendMessage/${this.accessToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatId: `${formattedPhone}@c.us`,
                    message: data.message
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(`WhatsApp API error: ${result.error || 'Unknown error'}`)
            }

            return {
                success: true,
                messageId: result.idMessage,
                phone: formattedPhone,
                service: 'whatsapp'
            }
        } catch (error) {
            console.error('WhatsApp send error:', error)
            throw error
        }
    }

    async sendLoyaltyUpdate(data: LoyaltyWhatsAppMessage): Promise<any> {
        const { customerName, businessName, points, totalPoints, currentVisits, visitGoal } = data

        let message = `🎉 *${businessName || 'Loyalty Program'}*\n\n`
        message += `Hi ${customerName || 'there'}! 👋\n\n`

        if (points) {
            message += `✨ You earned *${points} points* today!\n`
            message += `🏆 Total points: *${totalPoints || points}*\n\n`
        }

        if (currentVisits !== undefined && visitGoal) {
            const remaining = visitGoal - currentVisits
            if (remaining <= 0) {
                message += `🎊 *CONGRATULATIONS!* You've completed your loyalty card!\n`
                message += `🎁 Claim your reward now!\n\n`
            } else {
                message += `📍 Visit ${currentVisits}/${visitGoal} completed\n`
                message += `🎯 Only ${remaining} more visits for your reward!\n\n`
            }
        }

        message += `Thank you for your loyalty! 💙`

        return this.sendMessage({
            phone: data.phone,
            message,
            customerName,
            businessName
        })
    }

    async sendWelcomeMessage(data: WhatsAppMessage): Promise<any> {
        const { customerName, businessName } = data

        const message = `🎉 *Welcome to ${businessName || 'our loyalty program'}!*\n\n` +
            `Hi ${customerName || 'there'}! 👋\n\n` +
            `You've successfully joined our loyalty program! 🎊\n\n` +
            `Start earning points with every visit and unlock amazing rewards! 🎁\n\n` +
            `Thank you for choosing us! 💙`

        return this.sendMessage({
            phone: data.phone,
            message,
            customerName,
            businessName
        })
    }

    async sendVisitReminder(data: LoyaltyWhatsAppMessage): Promise<any> {
        const { customerName, businessName, currentVisits, visitGoal } = data

        const remaining = visitGoal ? visitGoal - (currentVisits || 0) : 0

        const message = `👋 *${businessName || 'Loyalty Program'}*\n\n` +
            `Hi ${customerName || 'there'}! We miss you! 💙\n\n` +
            `You're so close to your reward! 🎁\n` +
            `📍 Current visits: ${currentVisits || 0}/${visitGoal || 10}\n` +
            `🎯 Just ${remaining} more visits to go!\n\n` +
            `Come visit us soon! ✨`

        return this.sendMessage({
            phone: data.phone,
            message,
            customerName,
            businessName
        })
    }

    // Test connection
    async testConnection(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/getSettings/${this.accessToken}`)
            const result = await response.json()

            return {
                success: response.ok,
                status: result.stateInstance || 'unknown',
                phone: result.wid || 'unknown'
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Connection failed'
            }
        }
    }
}

export const whatsappService = new WhatsAppService()