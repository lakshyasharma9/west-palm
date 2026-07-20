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

async function checkAndFixS3Configuration() {
  console.log('🔍 Checking S3 Bucket Configuration...\n');
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Region: ${process.env.AWS_REGION}\n`);

  try {
    // 1. Check if bucket exists
    console.log('1️⃣ Checking if bucket exists...');
    try {
      await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
      console.log('✅ Bucket exists\n');
    } catch (error) {
      console.error('❌ Bucket does not exist or no access:', error.message);
      return;
    }

    // 2. Check Public Access Block settings
    console.log('2️⃣ Checking Public Access Block settings...');
    try {
      const publicAccessBlock = await s3.getPublicAccessBlock({ Bucket: BUCKET_NAME }).promise();
      console.log('Current settings:', publicAccessBlock.PublicAccessBlockConfiguration);
      
      if (publicAccessBlock.PublicAccessBlockConfiguration.BlockPublicPolicy) {
        console.log('⚠️  Public policies are blocked. Attempting to disable...');
        await s3.putPublicAccessBlock({
          Bucket: BUCKET_NAME,
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: false,
            IgnorePublicAcls: false,
            BlockPublicPolicy: false,
            RestrictPublicBuckets: false
          }
        }).promise();
        console.log('✅ Public access block settings updated\n');
      } else {
        console.log('✅ Public access is allowed\n');
      }
    } catch (error) {
      if (error.code === 'NoSuchPublicAccessBlockConfiguration') {
        console.log('✅ No public access block configured (public access allowed)\n');
      } else {
        console.log('⚠️  Could not check/modify public access block:', error.message, '\n');
      }
    }

    // 3. Check and apply bucket policy
    console.log('3️⃣ Checking bucket policy...');
    try {
      const currentPolicy = await s3.getBucketPolicy({ Bucket: BUCKET_NAME }).promise();
      console.log('Current policy exists:', currentPolicy.Policy ? 'Yes' : 'No');
    } catch (error) {
      if (error.code === 'NoSuchBucketPolicy') {
        console.log('⚠️  No bucket policy found');
      }
    }

    console.log('Applying public read policy...');
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
        }
      ]
    };

    await s3.putBucketPolicy({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    }).promise();
    console.log('✅ Bucket policy applied successfully\n');

    // 4. Check CORS configuration
    console.log('4️⃣ Checking CORS configuration...');
    try {
      const cors = await s3.getBucketCors({ Bucket: BUCKET_NAME }).promise();
      console.log('Current CORS rules:', cors.CORSRules.length);
    } catch (error) {
      if (error.code === 'NoSuchCORSConfiguration') {
        console.log('⚠️  No CORS configuration found');
      }
    }

    console.log('Applying CORS configuration...');
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000
        }
      ]
    };

    await s3.putBucketCors({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    }).promise();
    console.log('✅ CORS configuration applied successfully\n');

    // 5. Test file access
    console.log('5️⃣ Testing file access...');
    try {
      const listResult = await s3.listObjectsV2({
        Bucket: BUCKET_NAME,
        MaxKeys: 5,
        Prefix: 'projects/'
      }).promise();

      if (listResult.Contents && listResult.Contents.length > 0) {
        console.log(`Found ${listResult.Contents.length} files in projects/ folder`);
        const testFile = listResult.Contents[0];
        const testUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${testFile.Key}`;
        console.log(`\nTest URL: ${testUrl}`);
        console.log('✅ Try opening this URL in browser - it should work now!\n');
      } else {
        console.log('⚠️  No files found in projects/ folder\n');
      }
    } catch (error) {
      console.log('⚠️  Could not list files:', error.message, '\n');
    }

    console.log('✅ S3 Configuration completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- Bucket policy: Public read access enabled');
    console.log('- CORS: Configured for all origins');
    console.log('- Files should now be accessible from Next.js frontend');
    console.log('\n🔄 Restart your Next.js frontend to clear cache');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the script
checkAndFixS3Configuration();
