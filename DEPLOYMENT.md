# Twiller Deployment Guide

## Overview
This guide covers deploying the Twiller application (Twitter clone) with:
- **Frontend**: Next.js application (Vercel recommended)
- **Backend**: Node.js/Express API (Railway, Render, or DigitalOcean)
- **Database**: MongoDB Atlas (cloud)

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account (already have)
- ✅ Vercel account (for frontend) - Sign up at https://vercel.com
- ✅ Railway/Render account (for backend) - Choose one:
  - Railway: https://railway.app
  - Render: https://render.com
- ✅ MongoDB Atlas account (for database) - https://www.mongodb.com/cloud/atlas

### Required Services
- ✅ Email service (for OTP):
  - Gmail SMTP (easiest for development)
  - SendGrid (recommended for production)
  - AWS SES (enterprise option)
- ✅ SMS service (for OTP):
  - Twilio (recommended)
  - AWS SNS

---

## MongoDB Atlas Setup

### Step 1: Create Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login
3. Create a **FREE** M0 cluster
4. Choose cloud provider (AWS recommended) and region (closest to your users)
5. Cluster name: `twiller-production`

### Step 2: Database Access
1. Go to **Database Access** → Add New Database User
2. Authentication Method: Password
3. Username: `twiller-admin`
4. Password: Generate secure password (save it!)
5. Database User Privileges: **Read and write to any database**

### Step 3: Network Access
1. Go to **Network Access** → Add IP Address
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
3. Or add your deployment platform's IP addresses

### Step 4: Get Connection String
1. Go to **Database** → Click **Connect**
2. Choose **Connect your application**
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string:
```
mongodb+srv://twiller-admin:<password>@twiller-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. Replace `<password>` with your actual password
6. Add database name before the `?`: `.../myFirstDatabase?retryWrites=...`

---

## Backend Deployment

### Option A: Railway (Recommended - Easy & Free)

#### Step 1: Prepare Backend
1. Ensure `BACKEND/package.json` has start script:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

2. Create `BACKEND/Procfile` (optional):
```
web: node server.js
```

#### Step 2: Deploy to Railway
1. Go to https://railway.app
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your `twiller` repository
5. Railway will auto-detect Node.js
6. Click **Add variables** to set environment variables (see below)
7. In Settings → Root Directory: Set to `BACKEND`
8. Deploy!

#### Step 3: Get Backend URL
- Railway will provide a URL like: `https://twiller-backend-production.up.railway.app`
- Save this URL for frontend configuration

### Option B: Render

1. Go to https://render.com
2. Sign in with GitHub
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - Name: `twiller-backend`
   - Root Directory: `BACKEND`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables (see below)
7. Create Web Service

---

## Frontend Deployment

### Vercel (Recommended)

#### Step 1: Prepare Frontend
1. Update `twiller/next.config.ts` for production:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
```

#### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Import your `twiller` repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `twiller`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variables (see below)
7. Click **Deploy**

#### Step 3: Custom Domain (Optional)
1. In Vercel project settings → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed

---

## Environment Variables

### Backend Environment Variables (Railway/Render)

```env
# MongoDB
MONGODB_URI=mongodb+srv://twiller-admin:<password>@twiller-production.xxxxx.mongodb.net/twitter?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Email Service (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Or SendGrid (Recommended for production)
# SENDGRID_API_KEY=your-sendgrid-api-key
# FROM_EMAIL=noreply@yourdomain.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Payment (if using Stripe)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Frontend Environment Variables (Vercel)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.up.railway.app

# Firebase (if using)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## Post-Deployment

### 1. Test the Application
- ✅ Visit your frontend URL
- ✅ Test user registration
- ✅ Test login (Chrome for OTP, Edge for direct)
- ✅ Test language switching
- ✅ Test posting tweets
- ✅ Test login history

### 2. Set Up Email Service

#### Gmail SMTP (Development/Testing)
1. Enable 2-Factor Authentication on your Google account
2. Generate App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

#### SendGrid (Production Recommended)
1. Sign up at https://sendgrid.com (Free tier: 100 emails/day)
2. Create API Key
3. Verify sender email address
4. Update backend `.env` with SendGrid credentials

### 3. Set Up SMS Service (Twilio)
1. Sign up at https://www.twilio.com (Free trial: $15 credit)
2. Get phone number
3. Copy Account SID, Auth Token, Phone Number
4. Update backend `.env` with Twilio credentials

### 4. Configure CORS
Update `BACKEND/server.js` CORS configuration:
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
```

### 5. Update API URLs in Frontend
In all frontend API calls, ensure using `process.env.NEXT_PUBLIC_API_URL`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

### 6. Monitor & Logs
- **Railway**: View logs in Dashboard → Deployments
- **Vercel**: View logs in Project → Deployments → View Function Logs
- **MongoDB Atlas**: Monitor in Database → Metrics

---

## Deployment Checklist

### Pre-Deployment
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access configured
- [ ] Connection string obtained
- [ ] Email service set up (Gmail/SendGrid)
- [ ] SMS service set up (Twilio)
- [ ] All environment variables documented

### Backend Deployment
- [ ] Backend deployed to Railway/Render
- [ ] Environment variables configured
- [ ] Database connection verified
- [ ] Backend URL obtained
- [ ] Health check endpoint working

### Frontend Deployment
- [ ] Frontend deployed to Vercel
- [ ] Backend API URL configured
- [ ] Build successful
- [ ] Frontend URL obtained
- [ ] CORS configured on backend

### Testing
- [ ] User registration works
- [ ] Login works (test Chrome OTP flow)
- [ ] Email OTP received
- [ ] SMS OTP received (if configured)
- [ ] Language switching works
- [ ] Tweet posting works
- [ ] Login history displays
- [ ] All pages load correctly

### Production Readiness
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled (automatic on Vercel/Railway)
- [ ] Error monitoring set up (Sentry recommended)
- [ ] Analytics configured (Google Analytics/Vercel Analytics)
- [ ] Rate limiting configured
- [ ] Backup strategy for database

---

## Cost Estimation

### Free Tier (Good for starting)
- **Vercel**: Free (Hobby plan)
- **Railway**: $5/month after free trial
- **MongoDB Atlas**: Free (M0 cluster, 512MB)
- **SendGrid**: Free (100 emails/day)
- **Twilio**: $15 free credit, then pay-as-you-go

### Monthly Cost: ~$5-10 to start

---

## Troubleshooting

### Backend Issues
- **Cannot connect to MongoDB**: Check connection string, IP whitelist
- **CORS errors**: Verify CORS_ORIGIN matches frontend domain
- **Email not sending**: Check Gmail app password or SendGrid API key
- **SMS not sending**: Verify Twilio credentials and phone number format

### Frontend Issues
- **API calls failing**: Check NEXT_PUBLIC_API_URL is correct
- **Build fails**: Check all dependencies in package.json
- **Images not loading**: Configure image domains in next.config.ts

### Database Issues
- **Slow queries**: Add indexes to frequently queried fields
- **Storage limit**: Upgrade from M0 cluster or clean old data

---

## Next Steps

1. **Security**:
   - Set up rate limiting
   - Add input validation
   - Implement request signing
   - Set up HTTPS redirects

2. **Performance**:
   - Add Redis caching
   - Implement CDN for static assets
   - Optimize database queries
   - Add image optimization

3. **Monitoring**:
   - Set up error tracking (Sentry)
   - Add performance monitoring
   - Configure uptime monitoring
   - Set up alerts

4. **Features**:
   - Add payment gateway (Stripe)
   - Implement file uploads (AWS S3)
   - Add real-time notifications (Socket.io)
   - Set up email newsletters

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## Questions?

If you encounter any issues during deployment, check:
1. Environment variables are correctly set
2. API URLs are correct (no trailing slashes)
3. Database connection string is valid
4. CORS is properly configured
5. All services are running

Good luck with your deployment! 🚀
