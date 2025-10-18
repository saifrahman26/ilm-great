'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import DashboardLayout from '@/components/DashboardLayout'
import {
    Users,
    Search,
    Download,
    Mail,
    Phone,
    Star,
    Gift,
    Eye,
    MessageSquare,
    UserPlus,
    Filter
} from 'lucide-react'
import Link from 'next/link'

export default function CustomersPage() {
    const { user, business } = useAuth()
    const { customers, loading: loadingData, error, refreshData, clearError } = useData()
    const [filteredCustomers, setFilteredCustomers] = useState(customers)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'visits' | 'lastVisit' | 'points'>('lastVisit')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive' | 'vip'>('all')

    // Update filtered customers when customers data changes
    useEffect(() => {
        setFilteredCustomers(customers)
    }, [customers])

    // Filter and search logic
    useEffect(() => {
        let filtered = [...customers]

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm) ||
                (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        // Apply category filter
        switch (filterBy) {
            case 'active':
                filtered = filtered.filter(customer => (customer.lastVisitDays || 0) <= 30)
                break
            case 'inactive':
                filtered = filtered.filter(customer => (customer.lastVisitDays || 0) > 30)
                break
            case 'vip':
                filtered = filtered.filter(customer => customer.visits >= (business?.visit_goal || 5) * 2)
                break
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
                    break
                case 'visits':
                    aValue = a.visits
                    bValue = b.visits
                    break
                case 'lastVisit':
                    aValue = new Date(a.last_visit).getTime()
                    bValue = new Date(b.last_visit).getTime()
                    break
                case 'points':
                    aValue = a.points || a.visits || 0
                    bValue = b.points || b.visits || 0
                    break
                default:
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        setFilteredCustomers(filtered)
    }, [customers, searchTerm, sortBy, sortOrder, filterBy, business])

    const exportToCSV = () => {
        const headers = ['Name', 'Phone', 'Email', 'Visits', 'Points', 'Last Visit', 'Rewards Earned', 'Days Since Last Visit']
        const csvData = filteredCustomers.map(customer => [
            customer.name,
            customer.phone,
            customer.email || '',
            customer.visits,
            customer.points || customer.visits,
            new Date(customer.last_visit).toLocaleDateString(),
            customer.rewardsEarned || 0,
            customer.lastVisitDays || 0
        ])

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const sendMessageToCustomer = async (customer: any) => {
        try {
            if (!customer.email) {
                alert('This customer does not have an email address.')
                return
            }

            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: customer.email,
                    customerName: customer.name,
                    currentVisits: customer.visits,
                    visitGoal: business?.visit_goal || 5,
                    businessName: business?.name,
                    message: `Thank you for being a loyal customer! You have ${customer.visits} visits with us.`,
                    subject: `Thank you from ${business?.name}!`,
                    template: 'thank-you'
                })
            })

            if (response.ok) {
                alert('Message sent successfully!')
            } else {
                alert('Failed to send message.')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message.')
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to access customers.</p>
                    <Link href="/login" className="mt-4 inline-block bg-teal-600 text-white px-4 py-2 rounded">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout title="Customers" subtitle="Manage your loyalty program members">
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-white text-xs">!</span>
                        </div>
                        <div>
                            <h4 className="text-red-800 font-medium">Error Loading Customers</h4>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                            <button
                                onClick={() => refreshData(true)}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500">Total Customers</p>
                            {loadingData && customers.length === 0 ? (
                                <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse mt-1 w-12"></div>
                            ) : (
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
                            )}
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500">Active (30 days)</p>
                            {loadingData && customers.length === 0 ? (
                                <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse mt-1 w-12"></div>
                            ) : (
                                <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                                    {customers.filter(c => (c.lastVisitDays || 0) <= 30).length}
                                </p>
                            )}
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500">VIP Customers</p>
                            {loadingData && customers.length === 0 ? (
                                <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse mt-1 w-12"></div>
                            ) : (
                                <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">
                                    {customers.filter(c => c.visits >= (business?.visit_goal || 5) * 2).length}
                                </p>
                            )}
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500">Total Rewards</p>
                            {loadingData && customers.length === 0 ? (
                                <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse mt-1 w-12"></div>
                            ) : (
                                <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">
                                    {customers.reduce((sum, c) => sum + (c.rewardsEarned || 0), 0)}
                                </p>
                            )}
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full text-base text-gray-900 placeholder-gray-500"
                        />
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        {/* Filter */}
                        <div className="relative flex-1">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value as any)}
                                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white w-full text-base text-gray-900"
                            >
                                <option value="all">All Customers</option>
                                <option value="active">Active (30 days)</option>
                                <option value="inactive">Inactive (30+ days)</option>
                                <option value="vip">VIP Customers</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="flex-1">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-')
                                    setSortBy(field as any)
                                    setSortOrder(order as any)
                                }}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full text-base text-gray-900"
                            >
                                <option value="lastVisit-desc">Latest Visit</option>
                                <option value="lastVisit-asc">Oldest Visit</option>
                                <option value="visits-desc">Most Visits</option>
                                <option value="visits-asc">Least Visits</option>
                                <option value="name-asc">Name A-Z</option>
                                <option value="name-desc">Name Z-A</option>
                                <option value="points-desc">Most Points</option>
                                <option value="points-asc">Least Points</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        <button
                            onClick={exportToCSV}
                            className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-base font-medium"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>
                        <Link
                            href="/register"
                            className="bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2 text-base font-medium"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Customer</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Customers List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Customer List ({filteredCustomers.length})
                    </h3>
                </div>

                {loadingData && customers.length === 0 ? (
                    <>
                        {/* Mobile Skeleton */}
                        <div className="block lg:hidden">
                            <div className="divide-y divide-gray-200">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                                                <div>
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                                                </div>
                                            </div>
                                            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Skeleton */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                                                    <div className="ml-4">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
                                                        <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
                                                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-1"></div>
                                                <div className="h-2 bg-gray-200 rounded-full animate-pulse w-16"></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : filteredCustomers.length > 0 ? (
                    <>
                        {/* Mobile Card Layout */}
                        <div className="block lg:hidden">
                            <div className="divide-y divide-gray-200">
                                {filteredCustomers.map((customer) => {
                                    const isVIP = customer.visits >= (business?.visit_goal || 5) * 2
                                    const isActive = (customer.lastVisitDays || 0) <= 30
                                    const progress = (customer.visits % (business?.visit_goal || 5)) / (business?.visit_goal || 5) * 100

                                    return (
                                        <div key={customer.id} className="p-4 hover:bg-gray-50">
                                            {/* Customer Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isVIP ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                                        'bg-gradient-to-r from-teal-400 to-teal-600'
                                                        }`}>
                                                        <span className="text-white font-medium text-lg">
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="text-base font-medium text-gray-900">
                                                                {customer.name}
                                                            </h4>
                                                            {isVIP && (
                                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{customer.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isVIP ? 'bg-purple-100 text-purple-800' :
                                                    isActive ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {isVIP ? 'VIP' : isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>

                                            {/* Customer Stats */}
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Visits & Progress</p>
                                                    <p className="text-sm font-medium text-gray-900">{customer.visits} visits</p>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-teal-500 h-2 rounded-full"
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {customer.visits % (business?.visit_goal || 5)}/{business?.visit_goal || 5} to reward
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Points & Rewards</p>
                                                    <p className="text-sm font-medium text-gray-900">{customer.points || customer.visits} points</p>
                                                    <p className="text-xs text-gray-500 mt-1">{customer.rewardsEarned || 0} rewards earned</p>
                                                </div>
                                            </div>

                                            {/* Last Visit & Actions */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500">Last visit</p>
                                                    <p className="text-sm text-gray-900">
                                                        {customer.lastVisitDays === 0 ? 'Today' :
                                                            customer.lastVisitDays === 1 ? '1 day ago' :
                                                                `${customer.lastVisitDays} days ago`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    {customer.email && (
                                                        <button
                                                            onClick={() => sendMessageToCustomer(customer)}
                                                            className="text-teal-600 hover:text-teal-900 p-2 rounded-lg hover:bg-teal-50"
                                                            title="Send Message"
                                                        >
                                                            <MessageSquare className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Visits
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Points
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Visit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCustomers.map((customer) => {
                                        const isVIP = customer.visits >= (business?.visit_goal || 5) * 2
                                        const isActive = (customer.lastVisitDays || 0) <= 30
                                        const progress = (customer.visits % (business?.visit_goal || 5)) / (business?.visit_goal || 5) * 100

                                        return (
                                            <tr key={customer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isVIP ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                                                'bg-gradient-to-r from-teal-400 to-teal-600'
                                                                }`}>
                                                                <span className="text-white font-medium text-sm">
                                                                    {customer.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {customer.name}
                                                                </div>
                                                                {isVIP && (
                                                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ID: {customer.id.slice(0, 8)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="flex items-center space-x-1 mb-1">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            <span>{customer.phone}</span>
                                                        </div>
                                                        {customer.email && (
                                                            <div className="flex items-center space-x-1">
                                                                <Mail className="w-3 h-3 text-gray-400" />
                                                                <span className="text-xs text-gray-500">{customer.email}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="font-medium">{customer.visits} visits</div>
                                                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                                                            <div
                                                                className="bg-teal-500 h-2 rounded-full"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {customer.visits % (business?.visit_goal || 5)}/{business?.visit_goal || 5} to reward
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{customer.points || customer.visits}</div>
                                                    <div className="text-xs text-gray-500">{customer.rewardsEarned || 0} rewards earned</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(customer.last_visit).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {customer.lastVisitDays === 0 ? 'Today' :
                                                            customer.lastVisitDays === 1 ? '1 day ago' :
                                                                `${customer.lastVisitDays} days ago`}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isVIP ? 'bg-purple-100 text-purple-800' :
                                                        isActive ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {isVIP ? 'VIP' : isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        {customer.email && (
                                                            <button
                                                                onClick={() => sendMessageToCustomer(customer)}
                                                                className="text-teal-600 hover:text-teal-900 p-1 rounded"
                                                                title="Send Message"
                                                            >
                                                                <MessageSquare className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 px-4">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                        <p className="text-gray-500 mb-6 text-sm sm:text-base">
                            {searchTerm || filterBy !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Get started by adding your first customer.'}
                        </p>
                        <Link
                            href="/register"
                            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center space-x-2 text-base font-medium"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Customer</span>
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}