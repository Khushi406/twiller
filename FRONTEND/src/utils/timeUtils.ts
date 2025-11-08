// Utility functions for time handling, specifically for IST timezone

/**
 * Get current time in IST (Indian Standard Time)
 * IST is UTC+5:30
 */
export const getCurrentISTTime = (): Date => {
  const now = new Date();
  // Convert to IST by adding 5 hours and 30 minutes
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  return new Date(now.getTime() + istOffset);
};

/**
 * Check if current time is within the allowed payment window (10 AM to 11 AM IST)
 */
export const isPaymentTimeAllowed = (): boolean => {
  const istTime = getCurrentISTTime();
  const hours = istTime.getUTCHours(); // getUTCHours() gives us the hour in the adjusted timezone
  const minutes = istTime.getUTCMinutes();

  // Convert to minutes since midnight for easier comparison
  const currentMinutes = hours * 60 + minutes;
  const startMinutes = 10 * 60; // 10:00 AM
  const endMinutes = 11 * 60; // 11:00 AM

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

/**
 * Get formatted IST time string
 */
export const getFormattedISTTime = (): string => {
  const istTime = getCurrentISTTime();
  return istTime.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Get next available payment time in IST
 */
export const getNextPaymentTime = (): string => {
  const istTime = getCurrentISTTime();
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();

  let nextPaymentTime: Date;

  if (hours < 10) {
    // Before 10 AM, next payment time is 10 AM today
    nextPaymentTime = new Date(istTime);
    nextPaymentTime.setUTCHours(10, 0, 0, 0);
  } else if (hours >= 11) {
    // After 11 AM, next payment time is 10 AM tomorrow
    nextPaymentTime = new Date(istTime);
    nextPaymentTime.setUTCDate(nextPaymentTime.getUTCDate() + 1);
    nextPaymentTime.setUTCHours(10, 0, 0, 0);
  } else {
    // Between 10-11 AM, payment is currently allowed
    return 'Now';
  }

  return nextPaymentTime.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit'
  });
};
