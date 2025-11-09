# Phone OTP Service Implementation Guide

## Overview

Your Twiller app now supports **real phone OTP verification** using Twilio SMS service for:
1. ✅ **Phone Number Verification** - Add and verify phone numbers
2. ✅ **Language Switching** - Choose email OR phone OTP
3. ✅ **Password Reset** - Already supports both email and phone

## Setup Instructions

### 1. Get Twilio Credentials

1. **Sign up for Twilio**: https://www.twilio.com/try-twilio
   - You get **FREE trial credits** ($15-20) to test SMS
   - Trial account can send to verified phone numbers

2. **Get your credentials** from Twilio Console:
   - Account SID (starts with `AC...`)
   - Auth Token
   - Phone Number (buy one or use trial number)

3. **Add to BACKEND/.env**:
```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 2. Install Twilio Package (Already Installed)

```bash
cd BACKEND
npm install twilio
```

## New API Endpoints

### 1. Add Phone Number
```
POST /api/auth/add-phone
Headers: Authorization: Bearer <token>
Body: {
  "phone": "+1234567890"  // International format required
}

Response: {
  "message": "OTP sent to your phone number",
  "phone": "+1***90",
  "debug_otp": "123456"  // Only in development
}
```

### 2. Verify Phone Number
```
POST /api/auth/verify-phone
Headers: Authorization: Bearer <token>
Body: {
  "otp": "123456"
}

Response: {
  "message": "Phone number verified successfully",
  "phoneVerified": true
}
```

### 3. Resend Phone OTP
```
POST /api/auth/resend-phone-otp
Headers: Authorization: Bearer <token>

Response: {
  "message": "OTP sent to your phone number",
  "debug_otp": "123456"
}
```

### 4. Request Language Switch OTP (New - Supports Email OR Phone)
```
POST /api/auth/request-language-otp
Headers: Authorization: Bearer <token>
Body: {
  "language": "es",
  "method": "phone"  // or "email"
}

Response: {
  "message": "OTP sent to your phone",
  "method": "phone",
  "maskedValue": "+1***90",
  "debug_otp": "123456"
}
```

### 5. Forgot Password (Already Supports Both)
```
POST /api/auth/forgot-password
Body: {
  "method": "phone",  // or "email"
  "value": "+1234567890"  // or email
}

Response: {
  "message": "Password reset code sent to your phone.",
  "maskedValue": "+1***90"
}
```

## Frontend Implementation

### 1. Create Phone Verification Component

```tsx
// components/PhoneVerification.tsx
import { useState } from 'react';
import { apiService } from '@/lib/apiService';

export default function PhoneVerification() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleAddPhone = async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/auth/add-phone', { phone });
      alert(response.message);
      setStep('otp');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/auth/verify-phone', { otp });
      alert('Phone verified!');
      // Redirect or update UI
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {step === 'phone' ? (
        <>
          <input
            type="tel"
            placeholder="+1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={handleAddPhone} disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 rounded"
            maxLength={6}
          />
          <button onClick={handleVerifyPhone} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </>
      )}
    </div>
  );
}
```

### 2. Update Language Selector with Phone Option

```tsx
// components/LanguageSelector.tsx
const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email');

const handleLanguageChange = async (lang: string) => {
  // Show method selection dialog
  const method = await showMethodDialog(); // 'email' or 'phone'
  
  try {
    const response = await apiService.post('/auth/request-language-otp', {
      language: lang,
      method: method
    });
    
    alert(response.message);
    setShowOTPDialog(true);
  } catch (error) {
    alert(error.message);
  }
};
```

### 3. Update Forgot Password with Phone Option

```tsx
// components/ForgotPassword.tsx
const [method, setMethod] = useState<'email' | 'phone'>('email');
const [value, setValue] = useState('');

const handleForgotPassword = async () => {
  try {
    const response = await apiService.post('/auth/forgot-password', {
      method,
      value
    });
    
    alert(response.message);
    setStep('otp');
  } catch (error) {
    alert(error.message);
  }
};

return (
  <div>
    <select value={method} onChange={(e) => setMethod(e.target.value)}>
      <option value="email">Email</option>
      <option value="phone">Phone</option>
    </select>
    
    <input
      type={method === 'email' ? 'email' : 'tel'}
      placeholder={method === 'email' ? 'email@example.com' : '+1234567890'}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
    
    <button onClick={handleForgotPassword}>
      Send OTP
    </button>
  </div>
);
```

## Testing with Twilio Trial Account

### Trial Account Limitations:
- ⚠️ Can only send to **verified phone numbers**
- ⚠️ SMS will have "Sent from your Twilio trial account" prefix
- ✅ Get $15-20 free credits
- ✅ Perfect for testing

### Steps to Test:
1. Add a phone number to verify in Twilio Console: **Phone Numbers → Verified Caller IDs**
2. Use that verified number in your app
3. Check SMS on your phone
4. Enter OTP to verify

### For Production:
1. Upgrade Twilio account (add credit card)
2. Remove trial restrictions
3. Can send to any phone number
4. Remove "Sent from trial account" message

## Phone Number Format

**IMPORTANT**: Always use international format!

✅ **Correct**:
- `+1234567890` (US)
- `+447123456789` (UK)
- `+919876543210` (India)

❌ **Incorrect**:
- `1234567890` (missing +)
- `(123) 456-7890` (use only digits)

## Database Changes

The User model already has these fields (no migration needed):
```javascript
{
  phone: String,
  phoneOTP: String,
  phoneOTPExpires: Date,
  phoneVerified: Boolean,
  languageSwitchOTP: String,
  languageSwitchOTPExpires: Date
}
```

## Security Features

✅ **10-minute OTP expiration**
✅ **Masked phone numbers** in responses (+1***90)
✅ **Rate limiting** on password reset (24-hour window)
✅ **Phone uniqueness** check
✅ **Phone verification** required before use
✅ **Debug OTP** only shown in development mode

## Cost Estimation (Twilio)

| Volume | Cost per SMS | Monthly Cost |
|--------|-------------|--------------|
| 1,000 SMS/month | $0.0075 | ~$7.50 |
| 10,000 SMS/month | $0.0075 | ~$75.00 |
| 100,000 SMS/month | $0.0075 | ~$750.00 |

**Note**: Prices vary by country. US/Canada are cheapest.

## Alternative SMS Providers

If you prefer other services:

### 1. **Nexmo/Vonage**
- Similar pricing to Twilio
- Good international coverage
- npm package: `nexmo`

### 2. **AWS SNS**
- Cheaper for high volume
- Integrated with AWS ecosystem
- npm package: `aws-sdk`

### 3. **MSG91** (India)
- Very cheap for Indian SMS
- Good for India-focused apps
- npm package: `msg91-node`

### 4. **Fast2SMS** (India)
- Free tier available
- India only
- npm package: `fast-two-sms`

## Implementation Checklist

- [x] ✅ Backend SMS service created (`smsService.js`)
- [x] ✅ User model has phone fields
- [x] ✅ Add phone endpoint
- [x] ✅ Verify phone endpoint
- [x] ✅ Resend phone OTP endpoint
- [x] ✅ Enhanced language switch OTP (email or phone)
- [x] ✅ Forgot password already supports phone
- [ ] ⏳ Add Twilio credentials to `.env`
- [ ] ⏳ Create frontend phone verification component
- [ ] ⏳ Update language selector with phone option
- [ ] ⏳ Update forgot password with phone option
- [ ] ⏳ Add phone field to user profile page
- [ ] ⏳ Test with Twilio trial account

## Next Steps

1. **Get Twilio Account**: Sign up at https://www.twilio.com
2. **Add Credentials**: Update `BACKEND/.env` with your Twilio keys
3. **Test Backend**: Use Postman to test `/api/auth/add-phone`
4. **Build Frontend**: Create phone verification UI components
5. **Test End-to-End**: Add phone, verify, use for language/password

---

**Your app now has enterprise-grade phone OTP verification! 📱✨**
