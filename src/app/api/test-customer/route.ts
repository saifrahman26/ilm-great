import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 Creating test customer...')

        // Create a test customer
        const testPhone = `+1555${Date.now().toString().slice(-7)}`
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .insert({
                business_id: 'test-business-id',
                name: 'Test Customer',
                phone: testPhone,
                email: 'test@example.com',
                visits: 1,
                last_visit: new Date().toISOString()
            })
            .select()
            .single()

        if (customerError) {
            console.error('❌ Error creating test customer:', customerError)
            return NextResponse.json({
                success: false,
                error: customerError.message
            }, { status: 500 })
        }

        // Generate QR code with customer ID
        const qrData = customer.id
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

        // Update customer with QR code
        const { error: updateError } = await supabase
            .from('customers')
            .update({
                qr_code_url: qrCodeUrl,
                qr_data: qrData
            })
            .eq('id', customer.id)

        if (updateError) {
            console.error('❌ Error updating QR code:', updateError)
        }

        console.log('✅ Test customer created:', {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            qrData: qrData
        })

        return NextResponse.json({
            success: true,
            customer: {
                ...customer,
                qr_code_url: qrCodeUrl,
                qr_data: qrData
            },
            qrData: qrData,
            qrCodeUrl: qrCodeUrl,
            testInstructions: {
                scannerUrl: `/scanner`,
                directScanUrl: `/scanner?customer=${customer.id}`,
                testQrUrl: `/test-qr`
            }
        })

    } catch (error) {
        console.error('❌ Test customer creation error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to create test customer',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}