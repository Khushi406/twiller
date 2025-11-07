/**
 * Device Detection Utility
 * Parses user-agent string to extract browser, OS, and device information
 */

/**
 * Detect browser from user-agent string
 * @param {string} userAgent - User agent string
 * @returns {object} Browser information
 */
function detectBrowser(userAgent) {
  const ua = userAgent.toLowerCase();
  
  // Check for Edge (must be checked before Chrome as Edge includes Chrome in UA)
  if (ua.includes('edg/') || ua.includes('edge/')) {
    const version = ua.match(/edg?\/(\d+\.?\d*)/);
    return {
      name: 'edge',
      version: version ? version[1] : 'unknown',
      fullName: 'Microsoft Edge',
      isMicrosoft: true
    };
  }
  
  // Check for Chrome
  if (ua.includes('chrome/') && !ua.includes('edg')) {
    const version = ua.match(/chrome\/(\d+\.?\d*)/);
    return {
      name: 'chrome',
      version: version ? version[1] : 'unknown',
      fullName: 'Google Chrome',
      isMicrosoft: false
    };
  }
  
  // Check for Firefox
  if (ua.includes('firefox/')) {
    const version = ua.match(/firefox\/(\d+\.?\d*)/);
    return {
      name: 'firefox',
      version: version ? version[1] : 'unknown',
      fullName: 'Mozilla Firefox',
      isMicrosoft: false
    };
  }
  
  // Check for Safari (must be after Chrome check)
  if (ua.includes('safari/') && !ua.includes('chrome')) {
    const version = ua.match(/version\/(\d+\.?\d*)/);
    return {
      name: 'safari',
      version: version ? version[1] : 'unknown',
      fullName: 'Apple Safari',
      isMicrosoft: false
    };
  }
  
  // Check for Opera
  if (ua.includes('opera/') || ua.includes('opr/')) {
    const version = ua.match(/(?:opera|opr)\/(\d+\.?\d*)/);
    return {
      name: 'opera',
      version: version ? version[1] : 'unknown',
      fullName: 'Opera',
      isMicrosoft: false
    };
  }
  
  // Check for Internet Explorer
  if (ua.includes('msie') || ua.includes('trident/')) {
    const version = ua.match(/(?:msie |rv:)(\d+\.?\d*)/);
    return {
      name: 'ie',
      version: version ? version[1] : 'unknown',
      fullName: 'Internet Explorer',
      isMicrosoft: true
    };
  }
  
  return {
    name: 'unknown',
    version: 'unknown',
    fullName: 'Unknown Browser',
    isMicrosoft: false
  };
}

/**
 * Detect operating system from user-agent string
 * @param {string} userAgent - User agent string
 * @returns {object} OS information
 */
function detectOS(userAgent) {
  const ua = userAgent.toLowerCase();
  
  // Windows
  if (ua.includes('windows nt 10.0')) {
    return { name: 'Windows', version: '10/11', platform: 'windows' };
  }
  if (ua.includes('windows nt 6.3')) {
    return { name: 'Windows', version: '8.1', platform: 'windows' };
  }
  if (ua.includes('windows nt 6.2')) {
    return { name: 'Windows', version: '8', platform: 'windows' };
  }
  if (ua.includes('windows nt 6.1')) {
    return { name: 'Windows', version: '7', platform: 'windows' };
  }
  if (ua.includes('windows')) {
    return { name: 'Windows', version: 'unknown', platform: 'windows' };
  }
  
  // macOS
  if (ua.includes('mac os x')) {
    const version = ua.match(/mac os x (\d+[._]\d+)/);
    return {
      name: 'macOS',
      version: version ? version[1].replace('_', '.') : 'unknown',
      platform: 'mac'
    };
  }
  
  // iOS
  if (ua.includes('iphone') || ua.includes('ipad')) {
    const version = ua.match(/os (\d+[._]\d+)/);
    const device = ua.includes('ipad') ? 'iPad' : 'iPhone';
    return {
      name: 'iOS',
      version: version ? version[1].replace('_', '.') : 'unknown',
      platform: 'ios',
      device
    };
  }
  
  // Android
  if (ua.includes('android')) {
    const version = ua.match(/android (\d+\.?\d*)/);
    return {
      name: 'Android',
      version: version ? version[1] : 'unknown',
      platform: 'android'
    };
  }
  
  // Linux
  if (ua.includes('linux')) {
    return { name: 'Linux', version: 'unknown', platform: 'linux' };
  }
  
  return { name: 'Unknown', version: 'unknown', platform: 'unknown' };
}

/**
 * Detect device type from user-agent string
 * @param {string} userAgent - User agent string
 * @returns {object} Device information
 */
function detectDevice(userAgent) {
  const ua = userAgent.toLowerCase();
  
  // Mobile devices
  if (ua.includes('mobile') || ua.includes('android') && ua.includes('mobile')) {
    return {
      type: 'mobile',
      vendor: detectVendor(ua),
      model: detectModel(ua)
    };
  }
  
  // Tablets
  if (ua.includes('tablet') || ua.includes('ipad') || 
      (ua.includes('android') && !ua.includes('mobile'))) {
    return {
      type: 'tablet',
      vendor: detectVendor(ua),
      model: detectModel(ua)
    };
  }
  
  // Desktop
  if (ua.includes('windows') || ua.includes('mac os x') || ua.includes('linux')) {
    return {
      type: 'desktop',
      vendor: detectVendor(ua),
      model: 'Desktop Computer'
    };
  }
  
  return {
    type: 'unknown',
    vendor: 'Unknown',
    model: 'Unknown'
  };
}

/**
 * Detect device vendor
 * @param {string} ua - User agent string (lowercase)
 * @returns {string} Vendor name
 */
function detectVendor(ua) {
  if (ua.includes('samsung')) return 'Samsung';
  if (ua.includes('huawei')) return 'Huawei';
  if (ua.includes('xiaomi')) return 'Xiaomi';
  if (ua.includes('oppo')) return 'Oppo';
  if (ua.includes('vivo')) return 'Vivo';
  if (ua.includes('oneplus')) return 'OnePlus';
  if (ua.includes('nokia')) return 'Nokia';
  if (ua.includes('motorola')) return 'Motorola';
  if (ua.includes('lg')) return 'LG';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('macintosh')) return 'Apple';
  if (ua.includes('pixel')) return 'Google';
  if (ua.includes('windows')) return 'Microsoft';
  return 'Unknown';
}

/**
 * Detect device model
 * @param {string} ua - User agent string (lowercase)
 * @returns {string} Model name
 */
function detectModel(ua) {
  if (ua.includes('iphone')) {
    const model = ua.match(/iphone\s?(\w+)?/);
    return model ? `iPhone ${model[1] || ''}`.trim() : 'iPhone';
  }
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('pixel')) {
    const model = ua.match(/pixel (\d+)/);
    return model ? `Pixel ${model[1]}` : 'Pixel';
  }
  // For Android devices, try to extract model
  const androidModel = ua.match(/;\s*([^;)]+)\s+build/);
  if (androidModel) return androidModel[1].trim();
  
  return 'Unknown Model';
}

/**
 * Parse complete device information from request
 * @param {object} req - Express request object
 * @returns {object} Complete device information
 */
function parseDeviceInfo(req) {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                    req.headers['x-real-ip'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                    'Unknown';
  
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);
  const device = detectDevice(userAgent);
  
  return {
    userAgent,
    ipAddress,
    browser,
    os,
    device
  };
}

/**
 * Check if current time is within allowed time window (10 AM - 1 PM)
 * @returns {boolean} True if within allowed time
 */
function isWithinAllowedTime() {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 10 && hours < 13; // 10 AM to 1 PM (13:00 is 1 PM, so < 13)
}

/**
 * Determine if OTP is required based on browser and device
 * @param {object} deviceInfo - Device information from parseDeviceInfo
 * @returns {object} Authentication requirements
 */
function determineAuthRequirements(deviceInfo) {
  const { browser, device } = deviceInfo;
  
  // Mobile device restrictions (10 AM - 1 PM only)
  if (device.type === 'mobile') {
    const withinTime = isWithinAllowedTime();
    if (!withinTime) {
      return {
        allowed: false,
        requiresOTP: false,
        reason: 'Mobile access is only allowed between 10 AM and 1 PM',
        restriction: 'time_restricted'
      };
    }
    // Mobile within allowed time - check browser
    if (browser.name === 'chrome') {
      return {
        allowed: true,
        requiresOTP: true,
        otpMethod: 'email',
        reason: 'Chrome browser requires email OTP verification',
        restriction: 'otp_required'
      };
    }
  }
  
  // Desktop/Tablet - check browser
  if (browser.name === 'chrome') {
    return {
      allowed: true,
      requiresOTP: true,
      otpMethod: 'email',
      reason: 'Chrome browser requires email OTP verification',
      restriction: 'otp_required'
    };
  }
  
  // Microsoft Edge - no additional authentication
  if (browser.isMicrosoft) {
    return {
      allowed: true,
      requiresOTP: false,
      reason: 'Microsoft browser - direct access allowed',
      restriction: 'none'
    };
  }
  
  // Other browsers - allow with OTP for security
  return {
    allowed: true,
    requiresOTP: true,
    otpMethod: 'email',
    reason: 'Additional verification required for this browser',
    restriction: 'otp_required'
  };
}

module.exports = {
  detectBrowser,
  detectOS,
  detectDevice,
  parseDeviceInfo,
  isWithinAllowedTime,
  determineAuthRequirements
};
