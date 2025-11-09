require('dotenv').config();
const twilio = require('twilio');

console.log('\n🚀 Twilio Configuration Test\n');
console.log('=' .repeat(60));

// Check credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('✅ Checking Twilio credentials in .env...\n');

if (!accountSid) {
  console.error('❌ TWILIO_ACCOUNT_SID not found');
  process.exit(1);
}
if (!authToken) {
  console.error('❌ TWILIO_AUTH_TOKEN not found');
  process.exit(1);
}
if (!fromNumber) {
  console.error('❌ TWILIO_PHONE_NUMBER not found');
  process.exit(1);
}

console.log('📝 Account SID:', accountSid);
console.log('📝 From Number:', fromNumber);
console.log('📝 Auth Token:', '*'.repeat(authToken.length) + ' (hidden)');
console.log('');

// Initialize Twilio client
console.log('🔧 Initializing Twilio client...');
const client = twilio(accountSid, authToken);

// Test 1: Verify credentials by fetching account info
console.log('');
console.log('=' .repeat(60));
console.log('TEST 1: Verifying Account Credentials');
console.log('=' .repeat(60));

client.api.v2010.accounts(accountSid)
  .fetch()
  .then(account => {
    console.log('✅ Account verified successfully!');
    console.log('');
    console.log('📊 Account Details:');
    console.log('   - Account Name:', account.friendlyName);
    console.log('   - Status:', account.status);
    console.log('   - Type:', account.type);
    console.log('');
    
    // Test 2: List verified phone numbers
    console.log('=' .repeat(60));
    console.log('TEST 2: Fetching Verified Phone Numbers');
    console.log('=' .repeat(60));
    
    return client.validationRequests.list({ limit: 20 });
  })
  .then(validationRequests => {
    console.log('');
    console.log('📱 Note: During trial, you can only send SMS to verified numbers.');
    console.log('');
    console.log('To verify a phone number:');
    console.log('1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    console.log('2. Click "Add new phone number"');
    console.log('3. Enter your phone number and verify it');
    console.log('');
    
    // Test 3: Instructions for sending test SMS
    console.log('=' .repeat(60));
    console.log('READY TO TEST SMS!');
    console.log('=' .repeat(60));
    console.log('');
    console.log('✅ Your Twilio configuration is correct!');
    console.log('');
    console.log('📝 To send a test SMS:');
    console.log('');
    console.log('1. Edit test-twilio.js');
    console.log('2. Change line 40: const testPhone = "+YOUR_VERIFIED_PHONE";');
    console.log('3. Run: node test-twilio.js');
    console.log('');
    console.log('Example phone formats:');
    console.log('  - USA: +19876543210');
    console.log('  - India: +919876543210');
    console.log('  - UK: +447123456789');
    console.log('');
    console.log('=' .repeat(60));
    console.log('🎉 Setup Complete!');
    console.log('=' .repeat(60));
  })
  .catch(error => {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    
    if (error.code === 20003) {
      console.error('💡 Authentication failed. Please check:');
      console.error('   - Your Account SID is correct');
      console.error('   - Your Auth Token is correct');
      console.error('   - Get them from: https://console.twilio.com');
    } else if (error.status === 401) {
      console.error('💡 Unauthorized. Your Twilio credentials may be incorrect.');
    } else {
      console.error('💡 Unexpected error:', error);
    }
    
    process.exit(1);
  });
