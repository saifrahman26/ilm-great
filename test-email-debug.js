// Simple test to debug email sending
const testEmail = async () => {
    try {
        console.log('Testing email API...')

        const response = await fetch('http://localhost:3000/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                subject: 'Test Email',
                message: 'This is a test email to debug the email functionality.',
                template: 'simple'
            })
        })

        const result = await response.json()

        console.log('Response status:', response.status)
        console.log('Response data:', result)

        if (response.ok) {
            console.log('✅ Email API working!')
        } else {
            console.log('❌ Email API failed:', result)
        }
    } catch (error) {
        console.error('❌ Network error:', error)
    }
}

testEmail()