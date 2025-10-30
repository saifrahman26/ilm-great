'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import {
    Send,
    Users,
    Filter,
    Sparkles,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Clock,
    Target,
    MessageSquare,
    Zap
} from 'lucide-react'

interface Customer {
    id: string
    name: string
    email: string
    phone: string
    visits: number
    points: number
    is_active: boolean
    last_visit: string
    created_at: string
}

interface OfferCampaign {
    id: string
    title: string
    message: string
    target_filter: string
    sent_count: number
    created_at: string
    status: 'draft' | 'sending' | 'sent' | 'failed'
}

export default function OffersPage() {
    const { user, business, loading } = useAuth()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
    const [campaigns, setCampaigns] = useState<OfferCampaign[]>([])

    // Form states
    const [offerTitle, setOfferTitle] = useState('')
    const [offerMessage, setOfferMessage] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('all')
    const [customVisitRange, setCustomVisitRange] = useState({ min: 0, max: 100 })

    // UI states
    const [loadingCustomers, setLoadingCustomers] = useState(false)
    const [sendingOffer, setSendingOffer] = useState(false)
    const [generatingAI, setGeneratingAI] = useState(false)
    const [enhancingAI, setEnhancingAI] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPreview, setShowPreview] = useState(false)

    // Filter options
    const filterOptions = [
        { value: 'all', label: 'All Customers', icon: Users },
        { value: 'active', label: 'Active Customers', icon: CheckCircle },
        { value: 'inactive', label: 'Inactive Customers', icon: AlertCircle },
        { value: 'high_visits', label: 'High Visitors (10+ visits)', icon: Target },
        { value: 'low_visits', label: 'Low Visitors (1-5 visits)', icon: Clock },
        { value: 'new_customers', label: 'New Customers (Last 30 days)', icon: Sparkles },
        { value: 'custom_visits', label: 'Custom Visit Range', icon: Filter }
    ]

    useEffect(() => {
        if (business?.id) {
            fetchCustomers()
            fetchCampaigns()
        }
    }, [business?.id])

    useEffect(() => {
        applyFilter()
    }, [customers, selectedFilter, customVisitRange])

    const fetchCustomers = async () => {
        if (!business?.id) return

        setLoadingCustomers(true)
        try {
            const response = await fetch(`/api/customers?businessId=${business.id}`)
            const data = await response.json()

            if (response.ok) {
                setCustomers(data.customers || [])
            } else {
                setError('Failed to load customers')
            }
        } catch (err) {
            setError('Failed to load customers')
        }
        setLoadingCustomers(false)
    }

    const fetchCampaigns = async () => {
        if (!business?.id) return

        try {
            const response = await fetch(`/api/offer-campaigns?businessId=${business.id}`)
            const data = await response.json()

            if (response.ok) {
                setCampaigns(data.campaigns || [])
            }
        } catch (err) {
            console.error('Failed to load campaigns:', err)
        }
    }

    const applyFilter = () => {
        let filtered = [...customers]
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        switch (selectedFilter) {
            case 'active':
                filtered = filtered.filter(c => c.is_active)
                break
            case 'inactive':
                filtered = filtered.filter(c => !c.is_active)
                break
            case 'high_visits':
                filtered = filtered.filter(c => c.visits >= 10)
                break
            case 'low_visits':
                filtered = filtered.filter(c => c.visits >= 1 && c.visits <= 5)
                break
            case 'new_customers':
                filtered = filtered.filter(c => new Date(c.created_at) >= thirtyDaysAgo)
                break
            case 'custom_visits':
                filtered = filtered.filter(c =>
                    c.visits >= customVisitRange.min && c.visits <= customVisitRange.max
                )
                break
            default:
                // 'all' - no filtering
                break
        }

        setFilteredCustomers(filtered)
    }

    const generateAIMessage = async () => {
        if (!business?.name) return

        setGeneratingAI(true)
        setError('')

        try {
            const response = await fetch('/api/generate-offer-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName: business.name,
                    businessCategory: business.category || 'business',
                    offerTitle: offerTitle,
                    targetAudience: selectedFilter,
                    customerCount: filteredCustomers.length
                })
            })

            const data = await response.json()

            if (response.ok) {
                setOfferMessage(data.message)
                setSuccess('AI message generated successfully!')
            } else {
                setError(data.error || 'Failed to generate AI message')
            }
        } catch (err) {
            setError('Failed to generate AI message')
        }

        setGeneratingAI(false)
    }

    const enhanceWithAI = async () => {
        if (!offerMessage.trim()) return

        setEnhancingAI(true)
        setError('')

        try {
            const response = await fetch('/api/enhance-offer-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalMessage: offerMessage,
                    businessName: business?.name,
                    businessCategory: business?.category || 'business'
                })
            })

            const data = await response.json()

            if (response.ok) {
                setOfferMessage(data.enhancedMessage)
                setSuccess('Message enhanced with AI!')
            } else {
                setError(data.error || 'Failed to enhance message')
            }
        } catch (err) {
            setError('Failed to enhance message')
        }

        setEnhancingAI(false)
    }

    const sendOfferCampaign = async () => {
        if (!offerTitle.trim() || !offerMessage.trim() || filteredCustomers.length === 0) {
            setError('Please provide title, message, and select customers')
            return
        }

        setSendingOffer(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch('/api/send-offer-campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business?.id,
                    title: offerTitle,
                    message: offerMessage,
                    targetFilter: selectedFilter,
                    customerIds: filteredCustomers.map(c => c.id)
                })
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(`Offer sent successfully to ${data.sentCount} customers!`)
                setOfferTitle('')
                setOfferMessage('')
                fetchCampaigns()
            } else {
                setError(data.error || 'Failed to send offer')
            }
        } catch (err) {
            setError('Failed to send offer')
        }

        setSendingOffer(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user || !business) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Please log in to access offers management.</p>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout title="Marketing Offers" subtitle="Send targeted offers and promotions to your customers">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Customers</p>
                                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Active Customers</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {customers.filter(c => c.is_active).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Filtered</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredCustomers.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Send className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Campaigns Sent</p>
                                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Create Offer Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Create New Offer</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {success}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Offer Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Offer Title
                                    </label>
                                    <input
                                        type="text"
                                        value={offerTitle}
                                        onChange={(e) => setOfferTitle(e.target.value)}
                                        placeholder="e.g., 20% Off Weekend Special"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* AI Message Generation */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Offer Message
                                        </label>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={generateAIMessage}
                                                disabled={generatingAI || !offerTitle.trim()}
                                                className="flex items-center space-x-2 px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {generatingAI ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4" />
                                                )}
                                                <span>Generate with AI</span>
                                            </button>

                                            <button
                                                onClick={enhanceWithAI}
                                                disabled={enhancingAI || !offerMessage.trim()}
                                                className="flex items-center space-x-2 px-3 py-1 text-sm bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {enhancingAI ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Zap className="w-4 h-4" />
                                                )}
                                                <span>Enhance with AI</span>
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={offerMessage}
                                        onChange={(e) => setOfferMessage(e.target.value)}
                                        placeholder="Write your offer message here, or use AI to generate one..."
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Tip: Include your offer details, validity, and call-to-action
                                    </p>
                                </div>

                                {/* Send Button */}
                                <button
                                    onClick={sendOfferCampaign}
                                    disabled={sendingOffer || !offerTitle.trim() || !offerMessage.trim() || filteredCustomers.length === 0}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
                                >
                                    {sendingOffer ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            <span>Sending to {filteredCustomers.length} customers...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Send to {filteredCustomers.length} Customers</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Customer Filter Sidebar */}
                    <div className="space-y-6">
                        {/* Filter Options */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Customers</h3>

                            <div className="space-y-3">
                                {filterOptions.map((option) => {
                                    const Icon = option.icon
                                    return (
                                        <label key={option.value} className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="filter"
                                                value={option.value}
                                                checked={selectedFilter === option.value}
                                                onChange={(e) => setSelectedFilter(e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className={`flex items-center w-full p-3 rounded-lg border-2 transition-all ${selectedFilter === option.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}>
                                                <Icon className={`w-5 h-5 mr-3 ${selectedFilter === option.value ? 'text-blue-600' : 'text-gray-400'
                                                    }`} />
                                                <span className={`text-sm font-medium ${selectedFilter === option.value ? 'text-blue-900' : 'text-gray-700'
                                                    }`}>
                                                    {option.label}
                                                </span>
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>

                            {/* Custom Visit Range */}
                            {selectedFilter === 'custom_visits' && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Visit Range
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            value={customVisitRange.min}
                                            onChange={(e) => setCustomVisitRange(prev => ({
                                                ...prev,
                                                min: parseInt(e.target.value) || 0
                                            }))}
                                            placeholder="Min"
                                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="number"
                                            value={customVisitRange.max}
                                            onChange={(e) => setCustomVisitRange(prev => ({
                                                ...prev,
                                                max: parseInt(e.target.value) || 100
                                            }))}
                                            placeholder="Max"
                                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                        />
                                        <span className="text-xs text-gray-500">visits</span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Selected customers:</span>
                                    <span className="font-semibold text-blue-600">{filteredCustomers.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Message Preview */}
                        {showPreview && offerMessage && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Preview</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <MessageSquare className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-sm font-medium text-gray-700">{business?.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {offerMessage}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Campaigns */}
                {campaigns.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Campaigns</h3>
                        <div className="space-y-3">
                            {campaigns.slice(0, 5).map((campaign) => (
                                <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                                        <p className="text-sm text-gray-600">
                                            Sent to {campaign.sent_count} customers • {new Date(campaign.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                                            campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                                                campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {campaign.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}