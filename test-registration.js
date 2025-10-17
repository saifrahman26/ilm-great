// Test registration API directly
console.log('Testing registration API...')

fetch('https://loyallinkk.vercel.app/api/register-customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        businessId: '7952cb32-f70c-4a89-8c1c-8c29d326210a',
        name: 'Test Customer',
        phone: '1234567890',
        email: 'test@example.com'
    })
})
    .then(r => {
        console.log('Response status:', r.status)
        return r.json()
    })
    .then(data => {
        console.log('Response data:', JSON.stringify(data, null, 2))
    })
    .catch(err => {
        console.error('Error:', err)
    })