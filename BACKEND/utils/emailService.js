const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'demo@gmail.com',
      pass: process.env.EMAIL_PASS || 'demo_password'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose = 'audio upload') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@twiller.com',
      to: email,
      subject: `Twiller - Verification Code for ${purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1DA1F2;">Twiller Verification Code</h2>
          <p>Your verification code for ${purpose} is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message from Twiller.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send Invoice Email
const sendInvoiceEmail = async (email, invoiceDetails) => {
  try {
    const transporter = createTransporter();
    
    const { invoiceNumber, planName, amount, subscriptionStartDate, subscriptionEndDate } = invoiceDetails;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@twiller.com',
      to: email,
      subject: `Your Twiller Subscription Invoice (${invoiceNumber})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #1DA1F2; text-align: center;">Twiller Subscription Invoice</h2>
          <p>Thank you for subscribing! Here are the details of your recent payment:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Invoice Number:</td>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>${invoiceNumber}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Plan:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Amount Paid:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">₹${amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Subscription Period:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(subscriptionStartDate).toLocaleDateString()} - ${new Date(subscriptionEndDate).toLocaleDateString()}</td>
            </tr>
          </table>
          <p>Your subscription is now active. Enjoy your new benefits!</p>
          <hr>
          <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message from Twiller.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendInvoiceEmail
};