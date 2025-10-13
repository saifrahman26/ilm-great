'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { supabase, Customer } from '@/lib/supabase'
import { useAuth } from './AuthContext'

interface CustomerWithStats extends Customer {
    totalSpent?: number
    lastVisitDays?: number
    rewardsEarned?: number
    points?: number
}

interface DataContextType {
    customers: CustomerWithStats[]
    loading: boolean
    error: string
    lastFetchTime: number
    refreshData: (force?: boolean) => Promise<void>
    clearError: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
    const { business } = useAuth()
    const [customers, setCustomers] = useState<CustomerWithStats[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [lastFetchTime, setLastFetchTime] = useState(0)
    const isMountedRef = useRef(true)
    const fetchingRef = useRef(false)

    const refreshData = useCallback(async (force = false) => {
        if (!business?.id || fetchingRef.current) return

        // Smart caching - only refetch if data is older than 2 minutes or forced
        const now = Date.now()
        if (!force && customers.length > 0 && (now - lastFetchTime) < 120000) {
            return
        }

        fetchingRef.current = true
        setLoading(true)
        setError('')

        try {
            const { data: customersData, error: customersError } = await supabase
                .from('customers')
                .select('id, name, phone, email, email_confirmed, visits, last_visit, business_id, created_at')
                .eq('business_id', business.id)
                .order('last_visit', { ascending: false })

            if (customersError) {
                throw new Error(customersError.message || 'Failed to fetch customers')
            }

            const enhancedCustomers = (customersData || []).map(customer => {
                const lastVisitDate = customer.last_visit ? new Date(customer.last_visit) : new Date()
                const daysSinceLastVisit = Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
                const visitGoal = business?.visit_goal || 5
                const rewardsEarned = Math.floor((customer.visits || 0) / visitGoal)

                return {
                    ...customer,
                    totalSpent: customer.visits || 0,
                    lastVisitDays: Math.max(0, daysSinceLastVisit),
                    rewardsEarned,
                    points: customer.visits || 0 // Use visits as fallback for points
                }
            })

            if (isMountedRef.current) {
                setCustomers(enhancedCustomers)
                setLastFetchTime(now)
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
            console.error('Error fetching customers:', errorMessage)
            if (isMountedRef.current) {
                setError(errorMessage)
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false)
            }
            fetchingRef.current = false
        }
    }, [business?.id, customers.length, lastFetchTime])

    const clearError = useCallback(() => {
        setError('')
    }, [])

    // Initial data fetch when business changes
    useEffect(() => {
        if (business?.id) {
            refreshData(true)
        }
    }, [business?.id])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false
        }
    }, [])

    const value = {
        customers,
        loading,
        error,
        lastFetchTime,
        refreshData,
        clearError
    }

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider')
    }
    return context
}