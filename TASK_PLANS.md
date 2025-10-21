# Comprehensive Task Plans for Twitter Clone Features

This document outlines detailed plans for each of the 6 specified tasks. Each plan is structured as a world-class expert would approach it, considering scalability, security, user experience, performance, and maintainability. Plans include subtasks, backend/frontend implementations, dependencies, and best practices.

## Task 1: Audio Upload Feature with Voice Recording and OTP Authentication

**Description:** Implement a feature allowing users to record voice and post as audio tweets. Require email OTP authentication before upload. Enforce constraints: audio ≤5 minutes, ≤100MB, upload window 2PM-7PM IST only.

**Status:** Pending (based on user input)

**Subtasks:**
1. Design audio recording UI component with start/stop controls and preview.
2. Implement client-side audio recording using Web Audio API or MediaRecorder.
3. Add client-side validation for duration (≤5 min) and file size (≤100MB).
4. Integrate time-based upload restriction (2PM-7PM IST) with server-side enforcement.
5. Implement OTP authentication flow via email before upload.
6. Create backend API for audio upload with validation and storage.
7. Update Tweet model to support audio attachments.
8. Integrate audio playback in Tweet component.
9. Add error handling and user feedback for restrictions.
10. Test edge cases (time zones, file formats, network issues).

**Backend Implementation:**
- **Routes:** New `/api/audio/upload` endpoint in `BACKEND/routes/audio.js` (already exists, enhance).
- **Validation:** Server-side checks for file size, duration (using ffmpeg or similar), time window (convert IST, use moment-timezone).
- **Authentication:** Integrate with existing OTP system in `BACKEND/routes/auth.js`, require email OTP verification before upload.
- **Storage:** Use cloud storage (e.g., AWS S3 or Firebase Storage) for audio files; store metadata in database.
- **Models:** Extend `Tweet.js` to include audioUrl, duration, size fields.
- **Security:** Rate limiting, file type validation (audio/*), sanitize inputs.
- **Dependencies:** Install ffmpeg for duration extraction, multer for file handling.

**Frontend Implementation:**
- **Components:** New `AudioRecorder.tsx` component in `twiller/src/components/`, integrate into `TweetComposer.tsx`.
- **Hooks:** Custom hook `useAudioRecorder` for recording logic.
- **Validation:** Client-side checks before upload; display warnings for time/size violations.
- **OTP Flow:** Use existing `OtpPrompt.tsx`, trigger email OTP on upload attempt.
- **UI/UX:** Progress indicators, error messages, time zone handling (use Intl.DateTimeFormat).
- **Integration:** Update `Feed.tsx` and `Tweet.tsx` to render audio players (HTML5 audio or custom player).
- **Dependencies:** Add libraries like `react-media-recorder` or native MediaRecorder API.

**Overall Plan:**
- Prioritize security: Ensure OTP is mandatory and time-locked.
- Scalability: Use CDN for audio delivery to reduce server load.
- Best Practices: Implement progressive enhancement (fallback for unsupported browsers), accessibility (ARIA labels), and testing (unit tests for validation).
- Timeline: 1 week (2 days backend, 3 days frontend, 2 days integration/testing).
- Risks: Time zone accuracy, browser compatibility for recording.

**UI/UX Planning:**
- **Recording Interface:** Large circular record button with pulsing animation during recording, waveform visualization using canvas, real-time duration counter (red when approaching 5 min limit).
- **Upload Flow:** Modal with progress bar, file size indicator, time window status (green if allowed, red if outside 2PM-7PM IST). Error messages with clear icons (e.g., clock for time restriction).
- **OTP Integration:** Seamless prompt overlay on upload attempt, with email input pre-filled, countdown timer for OTP expiry.
- **Accessibility:** Keyboard shortcuts (Space to record/stop), ARIA labels for all controls, high contrast mode support, screen reader announcements for status changes.
- **Mobile Responsiveness:** Touch-friendly buttons (minimum 44px), landscape mode support for recording, haptic feedback on record start/stop.
- **User Feedback:** Toast notifications for validation failures, success animations on upload completion, preview audio player with play/pause controls.
- **Edge Cases:** Fallback UI for unsupported browsers (e.g., "Recording not supported, please upload file"), offline detection with retry prompts.

## Task 2: Forgot Password Feature with Daily Limit and Password Generator

**Description:** Create a forgot password page/route for reset via email or phone. Limit to 1 request/day per user. Include password generator for random passwords (uppercase/lowercase only, no specials/numbers).

**Status:** Done (based on user input, but verify implementation)

**Subtasks:**
1. Design forgot password page with email/phone input.
2. Implement daily request limit tracking in database.
3. Create password generator function (random string, A-Z a-z only).
4. Send reset link/email with generated password or OTP.
5. Handle reset confirmation and update user password.
6. Add warning for exceeding daily limit.
7. Integrate with existing auth system.
8. Update UI for password reset flow.
9. Add security measures (token expiration, rate limiting).
10. Test for abuse prevention.

**Backend Implementation:**
- **Routes:** New `/api/auth/forgot-password` in `BACKEND/routes/auth.js`.
- **Logic:** Check daily limit (store in User model or separate table), generate password using crypto.randomBytes, send via emailService.
- **Models:** Add fields to `User.js` for lastResetRequest timestamp.
- **Security:** Use JWT for reset tokens, expire in 1 hour; hash new passwords.
- **Dependencies:** Enhance `emailService.js` for password emails.

**Frontend Implementation:**
- **Pages:** New `twiller/src/app/forgot-password/page.tsx` (already exists, enhance).
- **Components:** Form in `ForgotPassword.tsx` with validation.
- **Flow:** Input email/phone, submit, show success/warning messages.
- **Integration:** Link from login page, use existing auth context.
- **UI/UX:** Clear instructions, loading states, error handling.

**Overall Plan:**
- Security First: Ensure no password leaks, use secure random generation.
- Compliance: Align with GDPR for data handling.
- Best Practices: Implement CSRF protection, logging for security audits.
- Timeline: 3 days (1 day backend, 1 day frontend, 1 day testing).
- Risks: Email deliverability, user confusion on generated passwords.

**UI/UX Planning:**
- **Form Design:** Clean, minimal form with radio buttons for email/phone selection, input field with validation feedback (e.g., red border on invalid email).
- **Flow Visualization:** Step-by-step progress indicator (1. Enter contact, 2. Receive code, 3. Reset password), with back button.
- **Error Handling:** Inline error messages for invalid inputs, warning banner for daily limit exceeded with retry timer.
- **Accessibility:** Screen reader support for form labels, keyboard navigation, high contrast for error states.
- **Mobile Responsiveness:** Single-column layout, touch-friendly inputs, auto-focus on load.
- **User Feedback:** Success toast with generated password preview (masked), loading spinner during submission, email/SMS sent confirmation with animation.
- **Edge Cases:** Offline mode with cached form, rate limit visual countdown, fallback for SMS delivery issues.

## Task 3: Subscription System with Payment Gateway

**Description:** Implement subscriptions via Stripe/Razorpay. Plans: Free (1 tweet), Bronze (₹100/month, 3 tweets), Silver (₹300/month, 5 tweets), Gold (₹1000/month, unlimited). Email invoice after payment. Payments only 10-11 AM IST.

**Status:** Pending

**Subtasks:**
1. Set up payment gateway integration (Stripe/Razorpay).
2. Define subscription plans and pricing.
3. Implement time-based payment restriction (10-11 AM IST).
4. Create payment modal/page with plan selection.
5. Handle payment processing and webhook verification.
6. Update user subscription status post-payment.
7. Enforce tweet limits based on plan.
8. Send invoice email with plan details.
9. Add subscription management UI.
10. Test payment flows and edge cases.

**Backend Implementation:**
- **Routes:** New `/api/subscriptions` in `BACKEND/routes/subscriptions.js` (exists, enhance).
- **Payment:** Integrate Stripe/Razorpay SDK, handle webhooks for confirmation.
- **Models:** `Subscription.js` for plans, user subscriptions.
- **Logic:** Time checks using moment-timezone, update tweet limits in User model.
- **Email:** Use `emailService.js` for invoices.
- **Security:** Validate webhooks, PCI compliance.

**Frontend Implementation:**
- **Components:** `PaymentModal.tsx`, `SubscriptionPage.tsx` (exist, enhance).
- **Integration:** Use payment SDKs, handle success/failure.
- **UI:** Plan cards, payment form, confirmation.
- **Context:** Update auth context with subscription status.

**Overall Plan:**
- Scalability: Handle concurrent payments, use queues if needed.
- Best Practices: Secure API keys, user-friendly error messages.
- Timeline: 1 week (3 days backend, 2 days frontend, 2 days testing).
- Risks: Currency handling, gateway downtime.

## Task 4: Multi-Language Support with Authentication

**Description:** Add language selector for Spanish, Hindi, Portuguese, Chinese, French, English. For French: email OTP; others: mobile OTP before switching.

**Status:** Done (verify)

**Subtasks:**
1. Set up i18n library (react-i18next).
2. Create translation files for each language.
3. Implement language selector component.
4. Add authentication for language switch (OTP based on language).
5. Update all components/pages for translations.
6. Handle RTL languages if needed.
7. Persist language preference.
8. Test translations and OTP flows.

**Backend Implementation:**
- **Routes:** Enhance auth for OTP on language switch.
- **Logic:** Check language, send email or SMS OTP.

**Frontend Implementation:**
- **i18n:** `twiller/src/i18n.ts` (exists), translation JSONs.
- **Components:** `LanguageSelector.tsx`.
- **Auth:** Integrate OTP prompt.

**Overall Plan:**
- Best Practices: Use professional translations, accessibility.
- Timeline: 4 days.
- Risks: Translation accuracy.

## Task 5: User Login Tracking and Restrictions

**Description:** Track login details (browser, OS, IP, device). Show history. Chrome: email OTP; Microsoft browser: no auth; Mobile: 10AM-1PM IST only.

**Status:** Done (but TODO.md shows fixes needed)

**Subtasks:**
1. Detect device/browser/OS on login.
2. Store in database.
3. Implement conditional auth.
4. Display history in profile.
5. Fix time logic as per TODO.

**Backend:** Enhance auth routes.
**Frontend:** Update LoginHistory component.

**Overall Plan:** Security-focused, fix bugs.

## Task 6: Notification Feature for Specific Keywords

**Description:** Browser notifications for tweets with "cricket" or "science". Enable/disable in profile.

**Status:** Done (but user mentions confusion)

**Subtasks:**
1. Implement Notification API usage.
2. Scan tweets for keywords.
3. Show popup with full tweet.
4. Settings in profile.

**Backend:** None, client-side.
**Frontend:** Use hooks, integrate in Feed.

**Overall Plan:** Permissions, user control.
