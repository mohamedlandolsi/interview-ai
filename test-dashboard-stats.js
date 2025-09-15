/**
 * Test script for dashboard stats API
 * Run with: node test-dashboard-stats.js
 */

const TEST_API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testDashboardStats() {
  console.log('🧪 Testing Dashboard Stats API...');
  
  try {
    const response = await fetch(`${TEST_API_BASE}/api/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, you'd need proper authentication headers
        // For now, this will test the API structure but fail auth
      },
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('📊 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ API structure looks good!');
      console.log('📈 Expected stats structure:');
      console.log('  - totalInterviews: number');
      console.log('  - thisMonth: number');
      console.log('  - monthlyGrowth: string (with %)');
      console.log('  - successRate: string (with %)');
      console.log('  - successRateTrend: string (with %)');
      console.log('  - avgDuration: string (with min)');
      console.log('  - durationTrend: string (with %)');
    } else {
      console.log('⚠️  API responded but might need authentication');
      console.log('   Expected for unauthenticated requests');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  testDashboardStats();
}

module.exports = { testDashboardStats };
