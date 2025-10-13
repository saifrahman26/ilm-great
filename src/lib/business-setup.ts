import { supabase } from './supabase'

export async function createBusinessRecord(businessData: {
    name: string
    email: string
    phone: string
    reward_title?: string
    reward_description?: string
    visit_goal?: number
    business_logo_url?: string
}) {
    try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            throw new Error('No authenticated user found')
        }

        // Create business record
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .insert({
                id: user.id,
                name: businessData.name,
                email: businessData.email,
                phone: businessData.phone,
                reward_title: businessData.reward_title || 'Free Coffee',
                reward_description: businessData.reward_description || 'Get a free coffee on us!',
                visit_goal: businessData.visit_goal || 5,
                business_logo_url: businessData.business_logo_url,
            })
            .select()
            .single()

        if (businessError) {
            throw businessError
        }

        // Create business settings
        try {
            const qrCodeData = `business-${user.id}-${Date.now()}`
            await supabase
                .from('business_settings')
                .insert({
                    business_id: user.id,
                    qr_code_data: qrCodeData,
                    points_per_visit: 1,
                    email_notifications: true,
                    auto_rewards: true
                })
        } catch (settingsError) {
            console.log('Business settings creation failed (table may not exist yet):', settingsError)
        }

        return { business, error: null }
    } catch (error) {
        console.error('Business creation error:', error)
        return { business: null, error }
    }
}