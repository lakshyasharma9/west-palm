require('dotenv').config();

/**
 * Quick Setup Verification Script
 * Run: node scripts/verify-setup.js
 */

console.log('\n🔍 WPCS Backend Setup Verification\n');
console.log('='.repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('='.repeat(50));

const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'DYNAMODB_QUERIES_TABLE',
  'DYNAMODB_ADMIN_TABLE',
  'S3_BUCKET_NAME',
  'JWT_SECRET'
];

let allEnvVarsPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('KEY') ? '***' : value}`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allEnvVarsPresent = false;
  }
});

// Check AWS SDK
console.log('\n📦 Dependencies:');
console.log('='.repeat(50));

try {
  require('aws-sdk');
  console.log('✅ aws-sdk: Installed');
} catch (e) {
  console.log('❌ aws-sdk: Not installed');
}

try {
  require('bcryptjs');
  console.log('✅ bcryptjs: Installed');
} catch (e) {
  console.log('❌ bcryptjs: Not installed');
}

try {
  require('jsonwebtoken');
  console.log('✅ jsonwebtoken: Installed');
} catch (e) {
  console.log('❌ jsonwebtoken: Not installed');
}

try {
  require('uuid');
  console.log('✅ uuid: Installed');
} catch (e) {
  console.log('❌ uuid: Not installed');
}

// Test AWS Connection
console.log('\n🔗 AWS Connection Test:');
console.log('='.repeat(50));

const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB();
const s3 = new AWS.S3();

// Test DynamoDB
dynamoDB.listTables({}, (err, data) => {
  if (err) {
    console.log('❌ DynamoDB Connection: Failed');
    console.log('   Error:', err.message);
  } else {
    console.log('✅ DynamoDB Connection: Success');
    console.log('   Tables found:', data.TableNames.length);
    
    // Check if our tables exist
    const queriesTableExists = data.TableNames.includes(process.env.DYNAMODB_QUERIES_TABLE);
    const adminTableExists = data.TableNames.includes(process.env.DYNAMODB_ADMIN_TABLE);
    
    if (queriesTableExists) {
      console.log(`   ✅ ${process.env.DYNAMODB_QUERIES_TABLE} exists`);
    } else {
      console.log(`   ❌ ${process.env.DYNAMODB_QUERIES_TABLE} NOT FOUND`);
    }
    
    if (adminTableExists) {
      console.log(`   ✅ ${process.env.DYNAMODB_ADMIN_TABLE} exists`);
    } else {
      console.log(`   ❌ ${process.env.DYNAMODB_ADMIN_TABLE} NOT FOUND`);
    }
  }
  
  // Test S3
  s3.listBuckets((err, data) => {
    if (err) {
      console.log('❌ S3 Connection: Failed');
      console.log('   Error:', err.message);
    } else {
      console.log('✅ S3 Connection: Success');
      console.log('   Buckets found:', data.Buckets.length);
      
      // Check if our bucket exists
      const bucketExists = data.Buckets.some(b => b.Name === process.env.S3_BUCKET_NAME);
      
      if (bucketExists) {
        console.log(`   ✅ ${process.env.S3_BUCKET_NAME} exists`);
      } else {
        console.log(`   ❌ ${process.env.S3_BUCKET_NAME} NOT FOUND`);
      }
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(50));
    
    if (allEnvVarsPresent) {
      console.log('✅ All environment variables are set');
    } else {
      console.log('❌ Some environment variables are missing');
      console.log('   Please check your .env file');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('='.repeat(50));
    console.log('1. If all checks pass, run: npm run create-admin');
    console.log('2. Then follow DEPLOYMENT_GUIDE.md to deploy Lambda functions');
    console.log('3. Setup API Gateway and get your API URL');
    console.log('4. Update frontend with API URL');
    console.log('\n✨ Good luck with deployment!\n');
  });
});
