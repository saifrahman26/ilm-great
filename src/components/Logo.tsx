import Image from 'next/image'

interface LogoProps {
    size?: number
    className?: string
    showText?: boolean
    textColor?: string
}

export default function Logo({
    size = 40,
    className = '',
    showText = false,
    textColor = 'text-gray-900'
}: LogoProps) {
    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className="relative" style={{ width: size, height: size }}>
                <Image
                    src="/logo.svg"
                    alt="LoyalLink Logo"
                    width={size}
                    height={size}
                    className="object-contain"
                />
            </div>
            {showText && (
                <span className={`font-bold text-xl ${textColor}`}>
                    LoyalLink
                </span>
            )}
        </div>
    )
}