/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 *
 * PRODUCTION NOTE: Replace in-memory storage with Redis for scalability
 */

import { ValidationError } from '../utils/errors.js';

// In-memory OTP storage (replace with Redis in production)
// Structure: { phone: { otp: '123456', expiresAt: timestamp } }
const otpStore = new Map();

// OTP configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  // Generate random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

/**
 * Send OTP to phone number
 * @param {string} phone - Phone number to send OTP to
 * @returns {Promise<{success: boolean, message: string, otp?: string}>}
 */
export const sendOTP = async (phone) => {
  // Validate phone number
  if (!phone || phone.length < 10) {
    throw new ValidationError('Invalid phone number');
  }

  // Generate OTP
  const otp = generateOTP();

  // Calculate expiry time
  const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store OTP with metadata
  otpStore.set(phone, {
    otp,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
  });

  // In production, send OTP via SMS (Twilio, AWS SNS, etc.)
  // await twilioClient.messages.create({
  //   body: `Your ALIVE verification code is: ${otp}`,
  //   to: phone,
  //   from: process.env.TWILIO_PHONE_NUMBER
  // });

  console.log(`📱 OTP for ${phone}: ${otp} (expires in ${OTP_EXPIRY_MINUTES} minutes)`);

  return {
    success: true,
    message: `OTP sent to ${phone}`,
    // Remove this in production! Only for development
    ...(process.env.NODE_ENV === 'development' && { otp }),
  };
};

/**
 * Verify OTP for phone number
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to verify
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyOTP = async (phone, otp) => {
  // Check if OTP exists for this phone
  const storedOTP = otpStore.get(phone);

  if (!storedOTP) {
    throw new ValidationError('No OTP found for this phone number. Please request a new OTP.');
  }

  // Check if OTP has expired
  if (Date.now() > storedOTP.expiresAt) {
    otpStore.delete(phone);
    throw new ValidationError('OTP has expired. Please request a new OTP.');
  }

  // Check max attempts
  if (storedOTP.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    throw new ValidationError('Maximum verification attempts exceeded. Please request a new OTP.');
  }

  // Increment attempts
  storedOTP.attempts++;

  // Verify OTP
  if (storedOTP.otp !== otp) {
    throw new ValidationError(`Invalid OTP. ${MAX_ATTEMPTS - storedOTP.attempts} attempts remaining.`);
  }

  // OTP is valid - remove from store
  otpStore.delete(phone);

  return {
    success: true,
    message: 'OTP verified successfully',
  };
};

/**
 * Check if OTP exists for phone number
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export const hasOTP = (phone) => {
  const storedOTP = otpStore.get(phone);
  return storedOTP && Date.now() <= storedOTP.expiresAt;
};

/**
 * Clear OTP for phone number
 * @param {string} phone - Phone number
 */
export const clearOTP = (phone) => {
  otpStore.delete(phone);
};

/**
 * Clean up expired OTPs (run periodically)
 */
export const cleanupExpiredOTPs = () => {
  const now = Date.now();
  let cleaned = 0;

  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired OTPs`);
  }
};

// Run cleanup every 10 minutes
setInterval(cleanupExpiredOTPs, 10 * 60 * 1000);

export default {
  sendOTP,
  verifyOTP,
  hasOTP,
  clearOTP,
  cleanupExpiredOTPs,
};
