'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SetupStatusTracker } from '@/lib/setupStatus'

export interface SetupGuardState {
    isLoading: boolean
    needsSetup: boolean
    showSetupPopup: boolean
    setupInfo: {
        setupCompleted: boolean
        hasNoRewards: boolean
    } | null
}

export function useSetupGuard() {
    const { user, business, loading: authLoading } = useAuth()
    const [state, setState] = useState<SetupGuardState>({
        isLoading: true,
        needsSetup: false,
        showSetupPopup: false,
        setupInfo: null
    })

    useEffect(() => {
        const checkSetupStatus = async () => {
            if (authLoading || !user || !business) {
                setState(prev => ({ ...prev, isLoading: authLoading }))
                return
            }

            try {
                const setupInfo = await SetupStatusTracker.getSetupInfo(business.id)

                setState({
                    isLoading: false,
                    needsSetup: setupInfo.needsSetup,
                    showSetupPopup: setupInfo.needsSetup,
                    setupInfo: {
                        setupCompleted: setupInfo.setupStatus.rewardSetupCompleted,
                        hasNoRewards: setupInfo.hasNoRewards
                    }
                })

                console.log('Setup status check:', {
                    businessId: business.id,
                    needsSetup: setupInfo.needsSetup,
                    setupCompleted: setupInfo.setupStatus.rewardSetupCompleted,
                    hasNoRewards: setupInfo.hasNoRewards
                })
            } catch (error) {
                console.error('Error checking setup status:', error)
                // On error, assume setup is needed to be safe
                setState({
                    isLoading: false,
                    needsSetup: true,
                    showSetupPopup: true,
                    setupInfo: {
                        setupCompleted: false,
                        hasNoRewards: true
                    }
                })
            }
        }

        checkSetupStatus()
    }, [user, business, authLoading])

    const completeSetup = () => {
        setState(prev => ({
            ...prev,
            needsSetup: false,
            showSetupPopup: false,
            setupInfo: {
                setupCompleted: true,
                hasNoRewards: false
            }
        }))
    }

    const skipSetup = () => {
        setState(prev => ({
            ...prev,
            showSetupPopup: false
        }))
    }

    const showSetup = () => {
        setState(prev => ({
            ...prev,
            showSetupPopup: true
        }))
    }

    return {
        ...state,
        completeSetup,
        skipSetup,
        showSetup,
        businessId: business?.id || '',
        businessName: business?.name || ''
    }
}