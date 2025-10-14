import { supabase } from './supabase'

export interface SetupStatus {
    rewardSetupCompleted: boolean
    setupCompletedAt?: Date
}

export class SetupStatusTracker {
    /**
     * Mark reward setup as complete for a business
     */
    static async markRewardSetupComplete(businessId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('businesses')
                .update({
                    reward_setup_completed: true,
                    setup_completed_at: new Date().toISOString(),
                })
                .eq('id', businessId)

            if (error) {
                // If columns don't exist, just log a warning and continue
                if (error.message.includes('reward_setup_completed') ||
                    error.message.includes('setup_completed_at') ||
                    error.message.includes('schema cache') ||
                    (error.message.includes('column') && error.message.includes('does not exist'))) {
                    console.warn('⚠️ Database schema outdated - setup tracking columns missing. Please run migration script.')
                    console.log('✅ Reward setup completed (tracking disabled until migration)')
                    return
                }
                throw new Error(`Failed to mark setup complete: ${error.message}`)
            }

            console.log('✅ Reward setup marked as complete for business:', businessId)
        } catch (error) {
            console.error('❌ Error marking setup complete:', error)
            throw error
        }
    }

    /**
     * Get setup status for a business
     */
    static async getSetupStatus(businessId: string): Promise<SetupStatus> {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('reward_setup_completed, setup_completed_at')
                .eq('id', businessId)
                .single()

            if (error) {
                // If columns don't exist, return default status instead of throwing
                if (error.message.includes('reward_setup_completed') ||
                    error.message.includes('setup_completed_at') ||
                    error.message.includes('schema cache') ||
                    (error.message.includes('column') && error.message.includes('does not exist'))) {
                    console.warn('⚠️ Database schema outdated - setup tracking columns missing. Returning default status.')
                    return {
                        rewardSetupCompleted: false
                    }
                }
                throw new Error(`Failed to get setup status: ${error.message}`)
            }

            return {
                rewardSetupCompleted: data.reward_setup_completed || false,
                setupCompletedAt: data.setup_completed_at ? new Date(data.setup_completed_at) : undefined
            }
        } catch (error) {
            console.error('❌ Error getting setup status:', error)
            // Return default status on error to allow graceful fallback
            return {
                rewardSetupCompleted: false
            }
        }
    }

    /**
     * Check if a business requires setup completion
     */
    static async requiresSetup(businessId: string): Promise<boolean> {
        try {
            const status = await this.getSetupStatus(businessId)
            return !status.rewardSetupCompleted
        } catch (error) {
            console.error('❌ Error checking setup requirement:', error)
            // Return true on error to be safe and prompt setup
            return true
        }
    }

    /**
     * Reset setup status (for testing or admin purposes)
     */
    static async resetSetupStatus(businessId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('businesses')
                .update({
                    reward_setup_completed: false,
                    setup_completed_at: null,
                })
                .eq('id', businessId)

            if (error) {
                throw new Error(`Failed to reset setup status: ${error.message}`)
            }

            console.log('🔄 Setup status reset for business:', businessId)
        } catch (error) {
            console.error('❌ Error resetting setup status:', error)
            throw error
        }
    }

    /**
     * Check if business has no reward settings (indicating incomplete setup)
     */
    static async hasNoRewardSettings(businessId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('reward_title, reward_description, visit_goal, created_at')
                .eq('id', businessId)
                .single()

            if (error) {
                console.error('❌ Error checking reward settings:', error)
                return false // Be more lenient on error
            }

            // Check if this is a very new business (created in last 5 minutes)
            const createdAt = new Date(data.created_at)
            const now = new Date()
            const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60)

            // If business was just created, don't require setup immediately
            if (minutesSinceCreation < 5) {
                console.log('🆕 New business detected, skipping setup requirement for now')
                return false
            }

            // Check if rewards are empty or not configured
            const hasNoTitle = !data.reward_title || data.reward_title.trim() === ''
            const hasNoDescription = !data.reward_description || data.reward_description.trim() === ''

            return hasNoTitle && hasNoDescription // Both must be empty to require setup
        } catch (error) {
            console.error('❌ Error checking reward settings:', error)
            return false // Be more lenient on error
        }
    }

    /**
     * Get comprehensive setup information
     */
    static async getSetupInfo(businessId: string): Promise<{
        setupStatus: SetupStatus
        hasNoRewards: boolean
        needsSetup: boolean
    }> {
        try {
            const [setupStatus, hasNoRewards] = await Promise.all([
                this.getSetupStatus(businessId),
                this.hasNoRewardSettings(businessId)
            ])

            // Need setup if rewards are not configured OR setup not marked complete
            const needsSetup = hasNoRewards || !setupStatus.rewardSetupCompleted

            return {
                setupStatus,
                hasNoRewards,
                needsSetup
            }
        } catch (error) {
            console.error('❌ Error getting setup info:', error)
            return {
                setupStatus: { rewardSetupCompleted: false },
                hasNoRewards: true,
                needsSetup: true
            }
        }
    }
}