const twilio = require('twilio');

// Twilio credentials (use environment variables in production)
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACdemo_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'demo_token';
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

let client;
try {
  client = twilio(accountSid, authToken);
} catch (error) {
  console.log('Twilio client initialization failed, using demo mode');
  client = null;
}

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP SMS
const sendOTPSMS = async (phoneNumber, otp, purpose = 'language switch') => {
  try {
    const message = await client.messages.create({
      body: `Twiller - Your verification code for ${purpose} is: ${otp}. This code will expire in 10 minutes.`,
      from: fromPhoneNumber,
      to: phoneNumber
    });

    console.log('SMS sent successfully:', message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    // Fallback - log OTP to console for demo purposes
    console.log(`SMS failed, ${purpose} OTP for ${phoneNumber}: ${otp}`);
    return { success: false, error: error.message, demo_otp: otp };
  }
};

module.exports = {
  generateOTP,
  sendOTPSMS
};
