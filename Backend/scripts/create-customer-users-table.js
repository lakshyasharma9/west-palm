const AWS = require('aws-sdk');
require('dotenv').config();

const dynamodb = new AWS.DynamoDB({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const tableName = 'wpcs-customer-users';

const params = {
  TableName: tableName,
  KeySchema: [
    { AttributeName: 'customerId', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'customerId', AttributeType: 'S' },
    { AttributeName: 'username', AttributeType: 'S' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'username-index',
      KeySchema: [
        { AttributeName: 'username', KeyType: 'HASH' }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

async function createTable() {
  try {
    console.log('Creating customer users table...');
    await dynamodb.createTable(params).promise();
    console.log('✅ Table created successfully!');
    console.log('Waiting for table to become active...');
    
    await dynamodb.waitFor('tableExists', { TableName: tableName }).promise();
    console.log('✅ Table is now active!');
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('ℹ️  Table already exists');
    } else {
      console.error('❌ Error creating table:', error);
    }
  }
}

createTable();
