# Twilio Setup Guide for Phone OTP

## Step 1: Create Twilio Account

### 1.1 Sign Up
1. Go to https://www.twilio.com/try-twilio
2. Click **"Sign up"** or **"Start for free"**
3. Fill in the registration form:
   - First Name
   - Last Name
   - Email
   - Password
4. Click **"Start your free trial"**

### 1.2 Verify Your Email
1. Check your email inbox
2. Click the verification link from Twilio
3. Your email is now verified

### 1.3 Verify Your Phone Number
1. Twilio will ask you to verify your phone number
2. Enter your phone number (with country code)
   - Example: +1 234 567 8900 (USA)
   - Example: +91 98765 43210 (India)
3. Choose **SMS** or **Call** verification method
4. Enter the verification code you receive
5. Click **"Submit"**

### 1.4 Answer Survey Questions
Twilio will ask you a few questions:
- What do you plan to build with Twilio? → Select **"Account verification, 2FA, notifications"**
- Which Twilio products are you here to use? → Select **"SMS"**
- How do you want to build with Twilio? → Select **"With code"**
- What's your preferred programming language? → Select **"Node.js"**

## Step 2: Get Your Twilio Credentials

### 2.1 Find Your Account SID and Auth Token
1. After login, you'll see the **Twilio Console Dashboard**
2. Look for the **"Account Info"** section (top right or center)
3. You'll see:
   - **ACCOUNT SID** (starts with "AC...")
   - **AUTH TOKEN** (click the eye icon to reveal it)
4. **IMPORTANT**: Click the copy icon to copy these values

### 2.2 Get a Twilio Phone Number (FREE Trial Number)
1. In the left sidebar, click **"Phone Numbers"** → **"Manage"** → **"Buy a number"**
2. OR click the **"Get a Trial Number"** button on the dashboard
3. Twilio will suggest a phone number for you
4. Click **"Choose this number"**
5. Your Twilio phone number is now active! (Format: +1 234 567 8900)

## Step 3: Configure Your Application

### 3.1 Update Backend .env File

Open `BACKEND/.env` and add these lines:

```env
# Twilio Configuration (for Phone OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

Replace:
- `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` → Your actual Account SID
- `your_auth_token_here` → Your actual Auth Token
- `+1234567890` → Your Twilio phone number

### 3.2 Example Configuration

```env
# Real Example (with PLACEHOLDER values - replace with yours!)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567
```

## Step 4: Verify Installation

### 4.1 Check if Twilio is Already Installed

In the terminal, run:

```bash
cd BACKEND
npm list twilio
```

If you see `twilio@x.x.x`, it's already installed. If not, install it:

```bash
npm install twilio
```

### 4.2 Test Twilio Configuration

Create a test file to verify your setup:

**File: `BACKEND/test-twilio.js`**

```javascript
require('dotenv').config();
const { sendOTPSMS } = require('./utils/smsService');

async function testTwilio() {
  try {
    // Replace with YOUR verified phone number
    const testPhone = '+1234567890'; // IMPORTANT: Use a phone number you verified in Step 1.3
    const testOTP = '123456';
    
    console.log('🔄 Testing Twilio SMS service...');
    console.log('📱 Sending to:', testPhone);
    
    const result = await sendOTPSMS(testPhone, testOTP);
    
    console.log('✅ SMS sent successfully!');
    console.log('📝 Result:', result);
    
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    console.error('💡 Make sure:');
    console.error('   1. Your Twilio credentials are correct in .env');
    console.error('   2. The phone number is verified in Twilio');
    console.error('   3. The phone number includes country code (e.g., +1...)');
  }
}

testTwilio();
```

Run the test:

```bash
node test-twilio.js
```

You should receive an SMS with the OTP code!

## Step 5: Trial Account Limitations & Upgrade

### 5.1 Trial Account Limitations

**FREE Trial includes:**
- ✅ $15.50 in free credit (≈500 SMS messages)
- ✅ 1 free phone number
- ⚠️ Can ONLY send SMS to **verified phone numbers**
- ⚠️ All SMS will have prefix: "Sent from your Twilio trial account - "

**Verified Numbers:**
- You can add more verified numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified

### 5.2 How to Add Verified Phone Numbers (Trial)

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click **"+ Add new phone number"**
3. Enter the phone number you want to verify
4. Choose verification method (SMS or Call)
5. Enter the code you receive
6. Now you can send SMS to this number!

### 5.3 Upgrade to Paid Account (Remove Limitations)

**To send SMS to ANY phone number:**

1. Go to: https://console.twilio.com/billing
2. Click **"Upgrade"** or **"Add funds"**
3. Add payment method (credit card)
4. Add funds (minimum $20 recommended)
5. Benefits after upgrade:
   - ✅ Send SMS to ANY phone number (no verification needed)
   - ✅ Remove "Sent from your Twilio trial account" prefix
   - ✅ Higher rate limits
   - ✅ Production-ready

**Pricing:**
- SMS (USA/Canada): ~$0.0079 per message
- SMS (India): ~$0.0055 per message
- Phone Number: ~$1.15/month

**Cost Estimate:**
- 1000 SMS messages ≈ $7-8
- Monthly phone number ≈ $1.15
- Total: ~$10/month for moderate usage

## Step 6: Update Your Code to Use Phone OTP

### 6.1 Current Status

Your backend already has:
- ✅ `utils/smsService.js` - SMS sending functions
- ✅ User model with `phone` field
- ✅ OTP generation functions

### 6.2 Test the Integration

1. **Restart your backend** to load new .env variables:
   ```bash
   cd BACKEND
   npm start
   ```

2. **Test Forgot Password with Phone**:
   - Send POST request to: `http://localhost:5000/api/auth/forgot-password`
   - Body:
     ```json
     {
       "identifier": "+1234567890",
       "method": "phone"
     }
     ```

3. **Test Language Switch with Phone OTP**:
   - Send POST request to: `http://localhost:5000/api/auth/change-language`
   - Body:
     ```json
     {
       "language": "es",
       "method": "phone"
     }
     ```

## Step 7: Troubleshooting

### Common Issues:

#### Issue 1: "Unable to create record: The number is unverified"
**Solution:** Add the phone number to verified numbers (see Step 5.2)

#### Issue 2: "Authenticate" error
**Solution:** Check your Account SID and Auth Token in .env

#### Issue 3: "Invalid phone number"
**Solution:** Make sure phone number includes country code (+1, +91, etc.)

#### Issue 4: "Cannot find module 'twilio'"
**Solution:** Run `npm install twilio` in BACKEND folder

#### Issue 5: SMS not received
**Solutions:**
1. Check if phone number is verified in Twilio console
2. Check Twilio logs: https://console.twilio.com/us1/monitor/logs/sms
3. Verify phone number format includes country code
4. Check if trial credits are exhausted

## Step 8: Production Deployment

### 8.1 Add Twilio Environment Variables to Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your **backend service** (twiller-backend-2c3v)
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"** and add:
   - Key: `TWILIO_ACCOUNT_SID`, Value: `Your Account SID`
   - Key: `TWILIO_AUTH_TOKEN`, Value: `Your Auth Token`
   - Key: `TWILIO_PHONE_NUMBER`, Value: `Your Twilio Phone Number`
5. Click **"Save Changes"**
6. Render will automatically redeploy

### 8.2 Add to Vercel (Frontend)

If you need Twilio info in frontend:
1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add variables (prefix with `NEXT_PUBLIC_` if needed)

## Summary Checklist

- [ ] Created Twilio account
- [ ] Verified email
- [ ] Verified phone number
- [ ] Got Account SID
- [ ] Got Auth Token
- [ ] Got Twilio phone number
- [ ] Added credentials to BACKEND/.env
- [ ] Tested with test-twilio.js
- [ ] Added verified phone numbers for testing
- [ ] Tested forgot password with phone
- [ ] Tested language switch with phone OTP
- [ ] (Optional) Upgraded to paid account
- [ ] Added environment variables to Render
- [ ] Tested in production

---

## Next Steps

Once Twilio is set up, you can:

1. **Test locally** with verified phone numbers
2. **Update frontend** to show phone OTP option
3. **Deploy to production** with Render environment variables
4. **Upgrade to paid account** when ready for all users

## Support

- **Twilio Documentation**: https://www.twilio.com/docs/sms
- **Twilio Console**: https://console.twilio.com
- **Twilio Support**: https://support.twilio.com

---

**Need Help?** 
Let me know if you encounter any issues during setup! I can help you debug or create additional test scripts.
