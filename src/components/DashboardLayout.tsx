'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
    Users,
    QrCode,
    Settings,
    Menu,
    X,
    BarChart3,
    User,
    UserPlus,
    Camera,
    Gift
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'


interface DashboardLayoutProps {
    children: React.ReactNode
    title: string
    subtitle?: string
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const { user, business } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Sidebar navigation items
    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
        { name: 'Customers', href: '/customers', icon: Users },
        { name: 'Add Customer', href: '/register', icon: UserPlus },
        { name: 'Manual Visit', href: '/manual-visit', icon: User },
        { name: 'QR Scanner', href: '/scanner', icon: Camera },
        { name: 'QR Code', href: '/qr-code', icon: QrCode },
        { name: 'Rewards', href: '/rewards', icon: Gift },
        { name: 'Settings', href: '/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        {business?.business_logo_url ? (
                            <img
                                src={business.business_logo_url}
                                alt={`${business.name} logo`}
                                className="w-8 h-8 object-contain rounded"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                    {business?.name?.charAt(0) || 'B'}
                                </span>
                            </div>
                        )}
                        <span className="text-xl font-semibold text-gray-900">{business?.name || 'LoyalLink'}</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="mt-8 px-4 space-y-2">
                    {navigation.map((item, index) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 animate-in slide-in-from-left-2 ${isActive
                                    ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-500 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-teal-500' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3 px-4 py-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{business?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="w-full mt-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 lg:pl-0 transition-all duration-200 ease-in-out">
                {/* Top bar */}
                <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
                    <div className="flex items-center justify-between h-16 px-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                        <div className="w-10" />
                    </div>
                </div>

                {/* Main content */}
                <div className="p-6 animate-in fade-in duration-300">
                    {/* Page header */}
                    <div className="mb-8 hidden lg:block animate-in slide-in-from-top-2 duration-300 delay-100">
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
                    </div>

                    <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}