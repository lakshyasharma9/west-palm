require('dotenv').config();
const { createAdminUser } = require('../shared/db-helper');
const { hashPassword } = require('../shared/auth-helper');

/**
 * Script to create initial admin user
 * Run: node scripts/create-admin-user.js
 */

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...\n');

    // Admin credentials
    const email = 'admin@wpcs.com';
    const password = 'wpcs@2024';

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}\n`);

    // Hash password
    console.log('⏳ Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('✅ Password hashed successfully\n');

    // Create admin user in DynamoDB
    console.log('⏳ Creating admin user in DynamoDB...');
    const result = await createAdminUser(email, hashedPassword);

    if (result.success) {
      console.log('✅ Admin user created successfully!\n');
      console.log('📋 Login Credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}\n`);
      console.log('🎉 You can now login to the admin panel!');
    } else {
      console.error('❌ Failed to create admin user');
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 'ResourceNotFoundException') {
      console.error('\n⚠️  DynamoDB table not found!');
      console.error('   Make sure you have created the "wpcs-admin-users" table.');
    } else if (error.code === 'CredentialsError') {
      console.error('\n⚠️  AWS credentials error!');
      console.error('   Check your .env file and AWS credentials.');
    }
  }
}

// Run the script
createAdmin();
