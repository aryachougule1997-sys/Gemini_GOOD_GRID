// Simple manual test for authentication endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check:', healthResponse.data);

    // Test API info endpoint
    console.log('\n2. Testing API info endpoint...');
    const apiResponse = await axios.get(`${BASE_URL}`);
    console.log('✅ API info:', apiResponse.data);

    console.log('\n🎉 Basic endpoints are working!');
    console.log('\nTo test full authentication:');
    console.log('1. Set up database connection');
    console.log('2. Run database migrations');
    console.log('3. Test registration and login endpoints');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAuth();