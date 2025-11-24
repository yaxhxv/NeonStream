import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Hls from 'hls.js';
import { Box } from '@mui/material';

const VideoPlayer = forwardRef(({ src, onTimeUpdate, isLeader, syncTime }, ref) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play: () => {
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise.catch(error => {});
      }
    },
    pause: () => {
      videoRef.current.pause();
    },
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLeader || !onTimeUpdate) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isLeader, onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isLeader || syncTime <= 0) return;

    const syncTolerance = 1.5; 
    const difference = Math.abs(video.currentTime - syncTime);

    if (video.paused || difference > syncTolerance) {
      video.currentTime = syncTime;
    }
  }, [isLeader, syncTime]);

  return (
    <Box 
      component="video" 
      ref={videoRef} 
      sx={{ width: '100%', display: 'block' }} 
      muted 
      controls 
    />
  );
});

export default VideoPlayer;
