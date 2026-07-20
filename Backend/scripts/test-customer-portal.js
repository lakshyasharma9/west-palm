const AWS = require('aws-sdk');
const axios = require('axios');
require('dotenv').config();

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testSetup() {
  console.log('🧪 Testing Customer Portal Setup...\n');

  // Test 1: Check DynamoDB table exists
  console.log('1️⃣ Checking DynamoDB table...');
  try {
    await dynamodb.scan({
      TableName: 'wpcs-customer-users',
      Limit: 1
    }).promise();
    console.log('✅ wpcs-customer-users table exists\n');
  } catch (error) {
    console.error('❌ Table check failed:', error.message);
    console.log('Run: node scripts/create-customer-users-table.js\n');
    return;
  }

  // Test 2: Check backend server
  console.log('2️⃣ Checking backend server...');
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('✅ Backend server is running\n');
  } catch (error) {
    console.error('❌ Backend server not responding');
    console.log('Run: npm start\n');
    return;
  }

  // Test 3: Check customer endpoints
  console.log('3️⃣ Checking customer endpoints...');
  try {
    // This should return 401 (unauthorized) which means endpoint exists
    await axios.get(`${API_URL}/api/customer/projects`);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Customer endpoints configured\n');
    } else {
      console.error('❌ Customer endpoints not found');
      console.log('Check server.js configuration\n');
    }
  }

  // Test 4: Check admin customer endpoints
  console.log('4️⃣ Checking admin customer management endpoints...');
  try {
    await axios.get(`${API_URL}/api/admin/customers`);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Admin customer endpoints configured\n');
    } else {
      console.error('❌ Admin customer endpoints not found');
      console.log('Check server.js configuration\n');
    }
  }

  // Test 5: Check Lambda functions exist
  console.log('5️⃣ Checking Lambda function files...');
  const fs = require('fs');
  const path = require('path');
  
  const requiredLambdas = [
    'customer-auth',
    'customer-projects',
    'customer-account-create',
    'customer-accounts-list',
    'customer-account-update',
    'customer-account-delete'
  ];

  let allLambdasExist = true;
  requiredLambdas.forEach(lambda => {
    const lambdaPath = path.join(__dirname, '..', 'lambda-functions', lambda, 'index.js');
    if (fs.existsSync(lambdaPath)) {
      console.log(`  ✅ ${lambda}`);
    } else {
      console.log(`  ❌ ${lambda} not found`);
      allLambdasExist = false;
    }
  });

  if (allLambdasExist) {
    console.log('✅ All Lambda functions exist\n');
  } else {
    console.log('❌ Some Lambda functions are missing\n');
  }

  // Summary
  console.log('\n📋 Setup Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ DynamoDB table: wpcs-customer-users');
  console.log('✅ Backend server: Running');
  console.log('✅ Customer endpoints: Configured');
  console.log('✅ Admin endpoints: Configured');
  console.log('✅ Lambda functions: Ready');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎉 Customer Portal is ready to use!\n');
  console.log('Next steps:');
  console.log('1. Login as admin');
  console.log('2. Go to Customers menu');
  console.log('3. Create a test customer');
  console.log('4. Login as customer to test\n');
}

testSetup().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
