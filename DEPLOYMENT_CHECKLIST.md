# Quick Deployment Checklist

## Before You Start
- [ ] Read DEPLOYMENT.md completely
- [ ] Have your GitHub repository ready
- [ ] Ensure all code is committed and pushed

## Step 1: Database Setup (15 minutes)
- [ ] Create MongoDB Atlas account
- [ ] Create free M0 cluster
- [ ] Create database user with password
- [ ] Whitelist IP addresses (0.0.0.0/0 for simplicity)
- [ ] Get connection string
- [ ] Test connection locally

## Step 2: Email Service Setup (10 minutes)
- [ ] **Option A - Gmail** (Easiest for testing):
  - [ ] Enable 2FA on Google account
  - [ ] Generate App Password
  - [ ] Test sending email locally
  
- [ ] **Option B - SendGrid** (Recommended for production):
  - [ ] Sign up for SendGrid
  - [ ] Create API key
  - [ ] Verify sender email
  - [ ] Test API key

## Step 3: SMS Service Setup (10 minutes)
- [ ] Sign up for Twilio
- [ ] Get free trial credits ($15)
- [ ] Get Account SID
- [ ] Get Auth Token
- [ ] Get phone number
- [ ] Test sending SMS locally

## Step 4: Backend Deployment (20 minutes)
- [ ] Sign up for Railway or Render
- [ ] Connect GitHub repository
- [ ] Set root directory to `BACKEND`
- [ ] Add all environment variables:
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] PORT (5000)
  - [ ] NODE_ENV (production)
  - [ ] CORS_ORIGIN
  - [ ] EMAIL_SERVICE
  - [ ] EMAIL_USER
  - [ ] EMAIL_PASSWORD (or SENDGRID_API_KEY)
  - [ ] TWILIO_ACCOUNT_SID
  - [ ] TWILIO_AUTH_TOKEN
  - [ ] TWILIO_PHONE_NUMBER
- [ ] Deploy backend
- [ ] Copy backend URL (e.g., https://xxx.up.railway.app)
- [ ] Test backend health (visit /api/health if you have one)

## Step 5: Frontend Deployment (15 minutes)
- [ ] Sign up for Vercel
- [ ] Import GitHub repository
- [ ] Set root directory to `twiller`
- [ ] Add environment variable:
  - [ ] NEXT_PUBLIC_API_URL = (your backend URL)
- [ ] Deploy frontend
- [ ] Copy frontend URL (e.g., https://xxx.vercel.app)

## Step 6: Update CORS (5 minutes)
- [ ] Go back to Railway/Render
- [ ] Update CORS_ORIGIN environment variable with your Vercel URL
- [ ] Redeploy backend (or it may auto-redeploy)

## Step 7: Testing (15 minutes)
- [ ] Visit your frontend URL
- [ ] Test Registration:
  - [ ] Create new account
  - [ ] Verify email works (check if OTP received)
- [ ] Test Login:
  - [ ] Login with Chrome (should trigger OTP)
  - [ ] Verify OTP received
  - [ ] Enter OTP and login
  - [ ] Login with Edge (should login directly)
- [ ] Test Language Switching:
  - [ ] Try switching to French (should trigger email OTP)
  - [ ] Try switching to Spanish/Hindi/etc (should trigger phone OTP)
  - [ ] Verify translations work
- [ ] Test Tweet Posting:
  - [ ] Post a tweet
  - [ ] Verify it appears in feed
- [ ] Test Login History:
  - [ ] Go to profile dropdown → Login History
  - [ ] Verify your login attempts are shown
- [ ] Test Forgot Password:
  - [ ] Logout
  - [ ] Click "Forgot Password"
  - [ ] Verify OTP is received
  - [ ] Reset password

## Step 8: Optional - Custom Domain
- [ ] Purchase domain (Namecheap, GoDaddy, etc.)
- [ ] Add domain to Vercel
- [ ] Configure DNS records
- [ ] Wait for SSL certificate (automatic)
- [ ] Update CORS_ORIGIN on backend

## Estimated Total Time: 90 minutes

## Common Issues & Solutions

### Backend won't start
- Check MongoDB connection string is correct
- Verify all required environment variables are set
- Check logs in Railway/Render dashboard

### Frontend can't connect to backend
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check CORS_ORIGIN on backend matches frontend URL
- Ensure no trailing slashes in URLs

### Email OTP not working
- For Gmail: Verify App Password is correct (not regular password)
- For SendGrid: Verify API key and sender email
- Check spam folder

### SMS OTP not working
- Verify Twilio credentials
- Check phone number format (+1234567890)
- Verify trial credits remaining

### Database connection fails
- Check MongoDB Atlas IP whitelist
- Verify username/password in connection string
- Ensure database name is included in connection string

## Need Help?
1. Check DEPLOYMENT.md for detailed instructions
2. Review platform-specific documentation:
   - Railway: https://docs.railway.app
   - Vercel: https://vercel.com/docs
   - MongoDB Atlas: https://docs.atlas.mongodb.com
3. Check application logs in deployment platform

## After Successful Deployment

### Share Your App! 🎉
Your Twitter clone is now live at:
- Frontend: https://your-app.vercel.app
- Backend API: https://your-backend.up.railway.app

### Monitor Your App
- Set up error tracking (Sentry)
- Monitor performance (Vercel Analytics)
- Check database metrics (MongoDB Atlas)
- Set up uptime monitoring (UptimeRobot)

### Next Steps
- [ ] Add custom domain
- [ ] Set up proper error logging
- [ ] Configure backup strategy
- [ ] Implement rate limiting
- [ ] Add performance monitoring
- [ ] Set up CI/CD pipeline
- [ ] Create staging environment

Congratulations! Your app is deployed! 🚀
