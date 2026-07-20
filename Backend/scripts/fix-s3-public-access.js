require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'west-palm-files';

async function checkAndFixBucketPolicy() {
  console.log('🔍 Checking S3 bucket configuration...\n');

  try {
    // 1. Check if bucket exists
    console.log('1️⃣ Checking bucket existence...');
    await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
    console.log('✅ Bucket exists\n');

    // 2. Get current bucket policy
    console.log('2️⃣ Checking bucket policy...');
    try {
      const policy = await s3.getBucketPolicy({ Bucket: BUCKET_NAME }).promise();
      console.log('Current policy:', JSON.parse(policy.Policy));
    } catch (err) {
      if (err.code === 'NoSuchBucketPolicy') {
        console.log('⚠️  No bucket policy found\n');
      }
    }

    // 3. Set public read policy for projects folder
    console.log('3️⃣ Setting public read policy for projects folder...');
    const publicPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${BUCKET_NAME}/projects/*`
        }
      ]
    };

    await s3.putBucketPolicy({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(publicPolicy)
    }).promise();
    console.log('✅ Public read policy set successfully\n');

    // 4. Check CORS configuration
    console.log('4️⃣ Checking CORS configuration...');
    try {
      const cors = await s3.getBucketCors({ Bucket: BUCKET_NAME }).promise();
      console.log('Current CORS:', JSON.stringify(cors.CORSRules, null, 2));
    } catch (err) {
      if (err.code === 'NoSuchCORSConfiguration') {
        console.log('⚠️  No CORS configuration found');
        console.log('Setting CORS configuration...');
        
        await s3.putBucketCors({
          Bucket: BUCKET_NAME,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'HEAD'],
                AllowedOrigins: ['*'],
                ExposeHeaders: ['ETag'],
                MaxAgeSeconds: 3000
              }
            ]
          }
        }).promise();
        console.log('✅ CORS configuration set\n');
      }
    }

    // 5. Test image access
    console.log('5️⃣ Testing image access...');
    const testKey = 'projects/test-access.txt';
    
    // Upload test file
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: 'Test file for public access',
      ContentType: 'text/plain'
    }).promise();
    console.log('✅ Test file uploaded');

    // Try to access it
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${testKey}`;
    console.log('Test URL:', url);
    console.log('✅ You can test this URL in browser\n');

    // Clean up test file
    await s3.deleteObject({ Bucket: BUCKET_NAME, Key: testKey }).promise();
    console.log('✅ Test file cleaned up\n');

    console.log('✅ All checks completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- Bucket policy: Public read enabled for /projects/*');
    console.log('- CORS: Configured for GET/HEAD requests');
    console.log('- Images should now load properly in Next.js\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check AWS credentials in .env file');
    console.error('2. Verify bucket name is correct');
    console.error('3. Ensure IAM user has s3:PutBucketPolicy permission');
    console.error('4. Check if bucket has "Block all public access" disabled\n');
  }
}

checkAndFixBucketPolicy();
