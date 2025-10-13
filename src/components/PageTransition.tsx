'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
    children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 150) // Short delay to show transition

        return () => clearTimeout(timer)
    }, [pathname])

    return (
        <div className="relative">
            {isLoading && (
                <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center animate-in fade-in duration-150">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    </div>
                </div>
            )}
            <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {children}
            </div>
        </div>
    )
}