'use client'

interface LoadingSkeletonProps {
    className?: string
    lines?: number
    showAvatar?: boolean
}

export function LoadingSkeleton({ className = '', lines = 3, showAvatar = false }: LoadingSkeletonProps) {
    return (
        <div className={`animate-pulse ${className}`}>
            {showAvatar && (
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
            )}
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            <div className="bg-gray-200 px-6 py-4 animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="p-6">
                <LoadingSkeleton lines={4} />
            </div>
        </div>
    )
}

export function QRCodeSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8 animate-in fade-in duration-300">
            <div className="bg-gray-200 px-6 py-4 animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="p-6">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div className="text-center">
                        <div className="bg-gray-50 rounded-lg p-6 inline-block">
                            <div className="w-48 h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <LoadingSkeleton lines={6} />
                    </div>
                </div>
            </div>
        </div>
    )
}