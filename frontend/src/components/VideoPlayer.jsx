import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Hls from 'hls.js';

const VideoPlayer = forwardRef(({ src, onTimeUpdate, isLeader, syncTime }, ref) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // Expose play and pause methods to the parent component
  useImperativeHandle(ref, () => ({
    play: () => {
      const promise = videoRef.current.play();
      // Catch and ignore play interruption errors
      if (promise !== undefined) {
        promise.catch(error => {});
      }
    },
    pause: () => {
      videoRef.current.pause();
    },
  }));

  // Effect 1: Manages the HLS lifecycle.
  // This effect is responsible for setting up and tearing down the HLS stream.
  // It only re-runs if the `src` prop changes.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Aggressive settings to reduce latency
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    // Cleanup: This runs when the component unmounts or `src` changes.
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  // Effect 2: Handles time reporting for the leader player.
  // This effect runs only when `isLeader` or `onTimeUpdate` changes.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLeader || !onTimeUpdate) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    // Cleanup
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isLeader, onTimeUpdate]);

  // Effect 3: Handles synchronization for follower players.
  // This effect runs when `syncTime` changes. Crucially, it does NOT
  // destroy the HLS instance.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isLeader || syncTime <= 0) return;

    // The tolerance in seconds to prevent constant, jerky seeking.
    const syncTolerance = 1.5; // 1.5 seconds
    const difference = Math.abs(video.currentTime - syncTime);

    // We only seek if the video is paused or if the time difference
    // has exceeded our tolerance.
    if (video.paused || difference > syncTolerance) {
      video.currentTime = syncTime;
    }
  }, [isLeader, syncTime]);

  return <video ref={videoRef} style={{ width: '100%', height: '100%' }} muted controls />;
});

export default VideoPlayer;
