const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Get audio file duration in seconds
 * @param {string} filePath - Path to audio file
 * @returns {Promise<number>} - Duration in seconds
 */
const getAudioDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      
      const duration = metadata.format.duration;
      resolve(duration);
    });
  });
};

/**
 * Validate audio file duration
 * @param {string} filePath - Path to audio file
 * @param {number} maxDurationSeconds - Maximum allowed duration (default: 300 seconds = 5 minutes)
 * @returns {Promise<{valid: boolean, duration: number, message?: string}>}
 */
const validateAudioDuration = async (filePath, maxDurationSeconds = 300) => {
  try {
    const duration = await getAudioDuration(filePath);
    
    if (duration > maxDurationSeconds) {
      return {
        valid: false,
        duration: duration,
        message: `Audio duration (${Math.round(duration)}s) exceeds maximum allowed (${maxDurationSeconds}s = ${maxDurationSeconds/60} minutes)`
      };
    }
    
    return {
      valid: true,
      duration: duration
    };
  } catch (error) {
    throw new Error(`Failed to validate audio duration: ${error.message}`);
  }
};

/**
 * Get audio file metadata
 * @param {string} filePath - Path to audio file
 * @returns {Promise<object>} - Audio metadata
 */
const getAudioMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      
      resolve({
        duration: metadata.format.duration,
        size: metadata.format.size,
        bitRate: metadata.format.bit_rate,
        format: metadata.format.format_name,
        codec: audioStream ? audioStream.codec_name : 'unknown',
        sampleRate: audioStream ? audioStream.sample_rate : null,
        channels: audioStream ? audioStream.channels : null
      });
    });
  });
};

/**
 * Format duration in seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

module.exports = {
  getAudioDuration,
  validateAudioDuration,
  getAudioMetadata,
  formatDuration
};
