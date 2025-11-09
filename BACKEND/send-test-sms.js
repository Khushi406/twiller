require('dotenv').config();
const twilio = require('twilio');

// Your Twilio credentials (from .env)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

console.log('\n📱 Twilio SMS Test\n');
console.log('=' .repeat(60));

// 🔥 CHANGE THIS to your phone number (the one you verified with Twilio)
const TO_PHONE_NUMBER = '+1234567890'; // 👈 UPDATE THIS!

if (TO_PHONE_NUMBER === '+1234567890') {
  console.error('❌ Please update TO_PHONE_NUMBER in this file!');
  console.log('');
  console.log('Edit: BACKEND/send-test-sms.js');
  console.log('Line 15: const TO_PHONE_NUMBER = "+YOUR_PHONE";');
  console.log('');
  console.log('Example formats:');
  console.log('  - USA: +19876543210');
  console.log('  - India: +919876543210');
  console.log('  - UK: +447123456789');
  console.log('');
  console.log('Use the phone number you used to sign up for Twilio!');
  process.exit(1);
}

const testOTP = '123456';
const message = `Your Twiller verification code is: ${testOTP}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this message.`;

console.log('📤 Sending SMS...');
console.log('   From:', fromNumber);
console.log('   To:', TO_PHONE_NUMBER);
console.log('   Message:', message.substring(0, 50) + '...');
console.log('');

client.messages
  .create({
    body: message,
    from: fromNumber,
    to: TO_PHONE_NUMBER
  })
  .then(message => {
    console.log('✅ SMS SENT SUCCESSFULLY!');
    console.log('');
    console.log('📊 Message Details:');
    console.log('   - SID:', message.sid);
    console.log('   - Status:', message.status);
    console.log('   - To:', message.to);
    console.log('   - From:', message.from);
    console.log('   - Date:', message.dateCreated);
    console.log('');
    console.log('💬 Check your phone for the SMS!');
    console.log('');
    console.log('=' .repeat(60));
    console.log('🎉 Success! Twilio is working perfectly!');
    console.log('=' .repeat(60));
  })
  .catch(error => {
    console.error('');
    console.error('❌ ERROR SENDING SMS');
    console.error('=' .repeat(60));
    console.error('');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('');
    
    if (error.code === 21608) {
      console.error('💡 This phone number is NOT verified in Twilio.');
      console.error('');
      console.error('📝 To verify a phone number (FREE):');
      console.error('   1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      console.error('   2. Click "Add new phone number"');
      console.error('   3. Enter:', TO_PHONE_NUMBER);
      console.error('   4. Verify with the code you receive');
      console.error('   5. Run this test again');
    } else if (error.code === 20003) {
      console.error('💡 Authentication failed. Check your Twilio credentials in .env');
    } else if (error.code === 21211) {
      console.error('💡 Invalid phone number format.');
      console.error('   Phone number must include country code: +1, +91, etc.');
    } else if (error.code === 21606) {
      console.error('💡 The "From" number is not verified.');
      console.error('   Check TWILIO_PHONE_NUMBER in your .env file.');
    }
    
    console.error('');
    console.error('📚 More info: https://www.twilio.com/docs/api/errors/' + error.code);
    console.error('');
  });
