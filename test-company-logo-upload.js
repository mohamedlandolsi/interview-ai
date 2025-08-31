/**
 * Test script to check company logo upload functionality after RLS fix
 * This script will help verify the service role client fix for company logo uploads
 */

// Test company logo upload with verbose logging
async function testCompanyLogoUpload() {
  console.log('🧪 Testing company logo upload API...')
  
  try {
    // Create a test file (small 1x1 pixel PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGanRaGAAAAABJRU5ErkJggg=='
    
    // Convert base64 to Blob
    const response = await fetch(testImageData)
    const blob = await response.blob()
    
    // Create FormData
    const formData = new FormData()
    formData.append('logo', blob, 'test-logo.png')
    
    console.log('📤 Sending upload request...')
    
    // Make the API request
    const uploadResponse = await fetch('/api/company/logo', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    
    console.log('📊 Response status:', uploadResponse.status)
    console.log('📊 Response headers:', Object.fromEntries(uploadResponse.headers.entries()))
    
    const result = await uploadResponse.json()
    console.log('📊 Response body:', JSON.stringify(result, null, 2))
    
    if (uploadResponse.ok) {
      console.log('✅ Company logo upload test PASSED')
      console.log('📸 Logo URL:', result.logoUrl)
      console.log('🔄 Cache busted:', result.cache_busted)
      console.log('⏰ Timestamp:', result.timestamp)
    } else {
      console.log('❌ Company logo upload test FAILED')
      console.log('💥 Error:', result.error)
    }
    
  } catch (error) {
    console.error('💥 Test failed with exception:', error)
  }
}

// Run the test when the page loads
if (typeof window !== 'undefined') {
  console.log('🚀 Company Logo Upload Test Page Loaded')
  
  // Add a button to trigger the test
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.createElement('button')
    button.textContent = 'Test Company Logo Upload'
    button.style.padding = '10px 20px'
    button.style.margin = '20px'
    button.style.fontSize = '16px'
    button.style.backgroundColor = '#4CAF50'
    button.style.color = 'white'
    button.style.border = 'none'
    button.style.borderRadius = '4px'
    button.style.cursor = 'pointer'
    
    button.onclick = testCompanyLogoUpload
    
    document.body.appendChild(button)
    
    // Also add some info
    const info = document.createElement('div')
    info.innerHTML = `
      <h2>Company Logo Upload Test</h2>
      <p>This test verifies that the company logo upload API works with the service role client fix.</p>
      <p>Check the browser console for detailed logs.</p>
    `
    info.style.margin = '20px'
    info.style.fontFamily = 'Arial, sans-serif'
    
    document.body.insertBefore(info, button)
  })
}
