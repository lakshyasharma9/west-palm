require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.AWS_REGION });
const dynamodb = new AWS.DynamoDB();

async function createNewsTable() {
  const tableName = process.env.DYNAMODB_NEWS_TABLE || 'wpcs-news';

  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' } // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
      { AttributeName: 'publishDate', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'status-publishDate-index',
        KeySchema: [
          { AttributeName: 'status', KeyType: 'HASH' },
          { AttributeName: 'publishDate', KeyType: 'RANGE' }
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
    console.log(`\n🔄 Creating table: ${tableName}...`);
    const result = await dynamodb.createTable(params).promise();
    console.log('✅ Table created successfully!');
    console.log(`📋 Table Name: ${tableName}`);
    console.log(`📊 Status: ${result.TableDescription.TableStatus}`);
    console.log(`\n⏳ Waiting for table to become ACTIVE...`);
    console.log(`   This may take a minute or two.\n`);
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log(`\n⚠️  Table ${tableName} already exists!`);
    } else {
      console.error('\n❌ Error creating table:', error);
      throw error;
    }
  }
}

createNewsTable()
  .then(() => {
    console.log('\n✅ News table setup complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to create news table:', error);
    process.exit(1);
  });
