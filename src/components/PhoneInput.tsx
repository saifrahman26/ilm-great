'use client'

import { useState } from 'react'

interface PhoneInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    error?: string
    required?: boolean
}

const countryCodes = [
    { code: '+1', country: 'US/CA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
]

export default function PhoneInput({
    value,
    onChange,
    placeholder = "Enter phone number",
    className = "",
    error,
    required = false
}: PhoneInputProps) {
    const [selectedCountryCode, setSelectedCountryCode] = useState('+1')

    // Extract country code and number from value
    const getCountryCodeAndNumber = (fullNumber: string) => {
        const matchedCode = countryCodes.find(cc => fullNumber.startsWith(cc.code))
        if (matchedCode) {
            return {
                countryCode: matchedCode.code,
                number: fullNumber.slice(matchedCode.code.length)
            }
        }
        return {
            countryCode: selectedCountryCode,
            number: fullNumber
        }
    }

    const { countryCode, number } = getCountryCodeAndNumber(value)

    const handleCountryCodeChange = (newCode: string) => {
        setSelectedCountryCode(newCode)
        onChange(newCode + number)
    }

    const handleNumberChange = (newNumber: string) => {
        // Only allow digits and limit to 10 digits
        const cleanNumber = newNumber.replace(/\D/g, '').slice(0, 10)
        onChange(countryCode + cleanNumber)
    }

    return (
        <div className="space-y-1">
            <div className="flex">
                {/* Country Code Selector */}
                <select
                    value={countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black text-white text-sm min-w-[100px]"
                >
                    {countryCodes.map((cc) => (
                        <option key={cc.code} value={cc.code}>
                            {cc.flag} {cc.code}
                        </option>
                    ))}
                </select>

                {/* Phone Number Input */}
                <input
                    type="tel"
                    value={number}
                    onChange={(e) => handleNumberChange(e.target.value)}
                    placeholder={placeholder}
                    className={`flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black text-white placeholder-gray-400 ${className}`}
                    maxLength={10}
                    required={required}
                />
            </div>

            {/* Helper Text */}
            <p className="text-xs text-gray-500">
                Enter 10-digit phone number (without country code)
            </p>

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}