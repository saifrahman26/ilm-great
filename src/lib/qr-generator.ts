import QRCode from 'qrcode'
import { supabase } from './supabase'

export async function generateQRCode(customerId: string): Promise<string> {
    try {
        // Generate QR code URL
        const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scanner?customer=${customerId}`

        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })

        // Convert data URL to blob
        const response = await fetch(qrCodeDataUrl)
        const blob = await response.blob()

        // Upload to Supabase storage
        const fileName = `qr-codes/${customerId}.png`
        const { error } = await supabase.storage
            .from('qr-codes')
            .upload(fileName, blob, {
                contentType: 'image/png',
                upsert: true
            })

        if (error) {
            console.error('Error uploading QR code:', error)
            return qrCodeDataUrl // Return data URL as fallback
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('qr-codes')
            .getPublicUrl(fileName)

        return publicUrlData.publicUrl
    } catch (error) {
        console.error('Error generating QR code:', error)
        throw new Error('Failed to generate QR code')
    }
}