require('dotenv').config({ path: '../.env' });
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'west-palm-files';

async function makeFilesPublic() {
  console.log('🔍 Fetching all files from S3 bucket...\n');

  try {
    // List all objects in the bucket
    const listParams = {
      Bucket: BUCKET_NAME
      // No prefix - get all files
    };

    const data = await s3.listObjectsV2(listParams).promise();
    
    if (!data.Contents || data.Contents.length === 0) {
      console.log('❌ No files found in bucket');
      return;
    }

    console.log(`📁 Found ${data.Contents.length} files\n`);

    let successCount = 0;
    let failCount = 0;

    // Make each file public
    for (let i = 0; i < data.Contents.length; i++) {
      const file = data.Contents[i];
      console.log(`[${i + 1}/${data.Contents.length}] Processing: ${file.Key}`);

      try {
        // Try to set ACL to public-read
        await s3.putObjectAcl({
          Bucket: BUCKET_NAME,
          Key: file.Key,
          ACL: 'public-read'
        }).promise();

        console.log(`✅ Made public: ${file.Key}\n`);
        successCount++;
      } catch (error) {
        if (error.code === 'AccessControlListNotSupported') {
          console.log(`⚠️  ACL not supported for: ${file.Key}`);
          console.log(`   Bucket needs to have ACLs enabled in AWS Console\n`);
        } else {
          console.log(`❌ Failed: ${file.Key} - ${error.message}\n`);
        }
        failCount++;
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Successfully made public: ${successCount} files`);
    console.log(`❌ Failed: ${failCount} files`);
    console.log('═══════════════════════════════════════\n');

    if (failCount > 0 && failCount === data.Contents.length) {
      console.log('⚠️  ALL FILES FAILED!');
      console.log('\n📝 TO FIX THIS:');
      console.log('1. Go to AWS S3 Console');
      console.log('2. Select your bucket: west-palm-files');
      console.log('3. Go to "Permissions" tab');
      console.log('4. Under "Object Ownership", click "Edit"');
      console.log('5. Select "ACLs enabled"');
      console.log('6. Select "Bucket owner preferred"');
      console.log('7. Save changes');
      console.log('8. Run this script again\n');
      
      console.log('OR ALTERNATIVE:');
      console.log('1. Go to "Permissions" tab');
      console.log('2. Under "Block public access", click "Edit"');
      console.log('3. Uncheck "Block all public access"');
      console.log('4. Save changes');
      console.log('5. Add bucket policy (see BUCKET_POLICY.md)\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
makeFilesPublic()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
