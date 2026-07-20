const AWS = require('aws-sdk');
require('dotenv').config();

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function checkCustomers() {
  try {
    const result = await dynamodb.scan({
      TableName: 'wpcs-customer-users'
    }).promise();
    
    console.log(`Found ${result.Items.length} customers:\n`);
    result.Items.forEach(customer => {
      console.log(`- ${customer.username} (${customer.email})`);
      console.log(`  Customer ID: ${customer.customerId}`);
      console.log(`  Projects: ${customer.projectIds?.length || 0}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCustomers();
