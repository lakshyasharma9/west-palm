require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB();

const TABLE_NAME = process.env.DYNAMODB_NEWSLETTERS_TABLE || 'wpcs-newsletters';

async function createNewslettersTable() {
  const params = {
    TableName: TABLE_NAME,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'year', AttributeType: 'N' },
      { AttributeName: 'month', AttributeType: 'N' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'year-month-index',
        KeySchema: [
          { AttributeName: 'year', KeyType: 'HASH' },
          { AttributeName: 'month', KeyType: 'RANGE' }
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

  try {
    console.log(`\n🔨 Creating DynamoDB table: ${TABLE_NAME}...`);
    await dynamoDB.createTable(params).promise();
    console.log(`✅ Table ${TABLE_NAME} created successfully!`);
    console.log(`\n⏳ Waiting for table to become active...`);
    
    await dynamoDB.waitFor('tableExists', { TableName: TABLE_NAME }).promise();
    console.log(`✅ Table ${TABLE_NAME} is now active!`);
    
    console.log(`\n📋 Table Details:`);
    console.log(`   - Table Name: ${TABLE_NAME}`);
    console.log(`   - Primary Key: id (String)`);
    console.log(`   - GSI: year-month-index (year, month)`);
    console.log(`   - Read Capacity: 5 units`);
    console.log(`   - Write Capacity: 5 units`);
    
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log(`⚠️  Table ${TABLE_NAME} already exists!`);
    } else {
      console.error('❌ Error creating table:', error);
      throw error;
    }
  }
}

createNewslettersTable()
  .then(() => {
    console.log('\n✅ Newsletter table setup complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
