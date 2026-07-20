const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function createSampleCustomer() {
  console.log('👤 Creating sample customer account...\n');

  const customerId = `cust_${Date.now()}`;
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  const customer = {
    customerId,
    username: 'testcustomer',
    password: hashedPassword,
    email: 'customer@example.com',
    companyName: 'Test Company Inc.',
    oneDriveLink: 'https://onedrive.live.com/sample-folder',
    projectStatusSheetUrl: 'https://onedrive.live.com/embed?resid=sample',
    projectIds: [], // Will be populated when projects are assigned
    role: 'customer',
    createdAt: new Date().toISOString(),
    lastLogin: null
  };

  try {
    await dynamodb.put({
      TableName: 'wpcs-customer-users',
      Item: customer
    }).promise();

    console.log('✅ Sample customer created successfully!\n');
    console.log('Customer Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Customer ID: ${customer.customerId}`);
    console.log(`Username: ${customer.username}`);
    console.log(`Password: Test123!`);
    console.log(`Email: ${customer.email}`);
    console.log(`Company: ${customer.companyName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('You can now login with these credentials at /login\n');

  } catch (error) {
    console.error('❌ Error creating customer:', error);
    
    if (error.code === 'ResourceNotFoundException') {
      console.log('\nPlease run: node scripts/create-customer-users-table.js first\n');
    }
  }
}

createSampleCustomer();
