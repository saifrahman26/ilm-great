'use client'

interface PhoneInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    error?: string
    required?: boolean
}

export default function PhoneInput({
    value,
    onChange,
    placeholder = "9876543210",
    className = "",
    error,
    required = false
}: PhoneInputProps) {
    // Extract number from value (remove +91 if present)
    const getNumber = (fullNumber: string) => {
        if (fullNumber.startsWith('+91')) {
            return fullNumber.slice(3)
        }
        return fullNumber
    }

    const number = getNumber(value)

    const handleNumberChange = (newNumber: string) => {
        // Only allow digits and limit to 10 digits
        const cleanNumber = newNumber.replace(/\D/g, '').slice(0, 10)
        onChange('+91' + cleanNumber)
    }

    return (
        <div className="space-y-1">
            <div className="flex">
                {/* Fixed +91 Country Code */}
                <div className="px-4 py-3 sm:py-2 border border-gray-300 rounded-l-md bg-gray-50 text-black text-base sm:text-sm flex items-center">
                    +91
                </div>

                {/* Phone Number Input */}
                <input
                    type="tel"
                    value={number}
                    onChange={(e) => handleNumberChange(e.target.value)}
                    placeholder={placeholder}
                    className={`flex-1 px-4 py-3 sm:py-2 border border-l-0 border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder-gray-500 text-base sm:text-sm ${className}`}
                    maxLength={10}
                    required={required}
                />
            </div>

            {/* Helper Text */}
            <p className="text-xs text-gray-500">
                Enter 10-digit Indian mobile number
            </p>

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}