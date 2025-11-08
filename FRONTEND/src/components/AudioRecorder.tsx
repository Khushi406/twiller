'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Pause, Square, Trash2, Send } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds, default 300 (5 minutes)
  maxSize?: number; // in MB, default 100
}

const AudioRecorder = ({ 
  onAudioReady, 
  onCancel, 
  maxDuration = 300, 
  maxSize = 100 
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current time is between 2pm-7pm IST
  const isWithinAllowedTime = (): boolean => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hours = istTime.getUTCHours();
    return hours >= 14 && hours < 19; // 2pm to 7pm IST
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    // Check time restriction
    if (!isWithinAllowedTime()) {
      setError('Audio uploads are only allowed between 2:00 PM to 7:00 PM IST');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        
        // Check file size
        const sizeInMB = blob.size / (1024 * 1024);
        if (sizeInMB > maxSize) {
          setError(`Audio file too large (${sizeInMB.toFixed(1)}MB). Maximum allowed: ${maxSize}MB`);
          return;
        }

        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setError('');
      setDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          // Auto-stop at max duration
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioBlob(null);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setError('');
  };

  const handleSendAudio = () => {
    if (audioBlob && duration > 0) {
      onAudioReady(audioBlob, duration);
    }
  };

  // Update audio ref when audioBlob changes
  useEffect(() => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      return () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioBlob]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Record Audio Tweet</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!audioBlob ? (
        // Recording Interface
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-mono text-blue-400 mb-2">
              {formatTime(duration)} / {formatTime(maxDuration)}
            </div>
            <div className="text-sm text-gray-400">
              Audio uploads allowed: 2:00 PM - 7:00 PM IST
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isWithinAllowedTime() && !isRecording}
              className={`p-4 rounded-full transition-all ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed'
              }`}
            >
              {isRecording ? (
                <Square className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="flex justify-center space-x-1 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150" />
              </div>
              <p className="text-red-400 text-sm">Recording in progress...</p>
            </div>
          )}
        </div>
      ) : (
        // Playback Interface
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Audio Recording</span>
              <span className="text-blue-400 text-sm">{formatTime(duration)}</span>
            </div>
            
            {/* Audio Progress Bar */}
            <div className="relative w-full h-2 bg-gray-700 rounded-full mb-3">
              <div 
                className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{formatTime(currentTime)}</span>
              <div className="flex space-x-2">
                <button
                  onClick={playAudio}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={deleteRecording}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendAudio}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Add to Tweet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;