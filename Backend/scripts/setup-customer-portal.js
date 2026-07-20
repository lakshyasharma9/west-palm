const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Customer Portal...\n');

// Lambda functions that need dependencies
const lambdaFunctions = [
  'customer-auth',
  'customer-account-create',
  'customer-account-update'
];

console.log('📦 Installing Lambda function dependencies...\n');

lambdaFunctions.forEach(func => {
  const funcPath = path.join(__dirname, '..', 'lambda-functions', func);
  
  if (fs.existsSync(path.join(funcPath, 'package.json'))) {
    console.log(`Installing dependencies for ${func}...`);
    try {
      execSync('npm install', { cwd: funcPath, stdio: 'inherit' });
      console.log(`✅ ${func} dependencies installed\n`);
    } catch (error) {
      console.error(`❌ Error installing ${func} dependencies:`, error.message);
    }
  }
});

console.log('\n📊 Creating DynamoDB table...\n');
try {
  execSync('node scripts/create-customer-users-table.js', { stdio: 'inherit' });
  console.log('✅ DynamoDB table setup complete\n');
} catch (error) {
  console.error('❌ Error creating table:', error.message);
}

console.log('\n✨ Customer Portal setup complete!\n');
console.log('Next steps:');
console.log('1. Deploy Lambda functions to AWS');
console.log('2. Update API Gateway routes');
console.log('3. Configure frontend environment variables');
console.log('4. Run: npm start (to start backend server)');
console.log('5. Run: cd ../wpcs-admin-panel && npm run dev (to start frontend)\n');
