const AWS = require('aws-sdk');
require('dotenv').config();

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function checkProjectCustomers() {
  try {
    const projects = await dynamodb.scan({
      TableName: 'wpcs-projects'
    }).promise();
    
    console.log(`Found ${projects.Items.length} projects:\n`);
    projects.Items.forEach(project => {
      console.log(`- ${project.name}`);
      console.log(`  Project ID: ${project.id}`);
      console.log(`  customerIds: ${JSON.stringify(project.customerIds || [])}`);
      console.log('');
    });

    // Check specific customer
    const customerId = '5e343b5d-6192-4989-9ed0-f4cc385aa1ee';
    console.log(`\nProjects for customer ${customerId}:`);
    
    const customerProjects = projects.Items.filter(p => 
      p.customerIds && p.customerIds.includes(customerId)
    );
    
    console.log(`Found ${customerProjects.length} projects with this customer ID`);
    customerProjects.forEach(p => console.log(`  - ${p.name}`));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkProjectCustomers();
