import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Hls from 'hls.js';

// We need to forward the ref to get access to the component's imperative handles
const VideoPlayer = forwardRef(({ src, onTimeUpdate, isLeader, syncTime }, ref) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // Expose play, pause, and a new seekTo function to the parent component
  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current.play();
    },
    pause: () => {
      videoRef.current.pause();
    },
    seekTo: (time) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    }
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Configurations to reduce latency and improve sync
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        startLevel: 0,
        startPosition: -1,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 1,
        levelLoadingMaxRetry: 4
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('Manifest parsed. Ready to play.');
        // Don't auto-play; wait for parent command
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    // This function will be called by the leader to report its time
    const handleTimeUpdate = () => {
      if (isLeader && onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };

    // This is the core sync logic for follower videos
    const syncToLeader = () => {
      if (!isLeader && syncTime > 0) {
        // Only seek if the difference is significant to avoid jerky playback
        const difference = Math.abs(video.currentTime - syncTime);
        if (difference > 0.5) { // 500ms tolerance
          console.log(`Syncing video to ${syncTime}. Current: ${video.currentTime}, Diff: ${difference}`);
          video.currentTime = syncTime;
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    // For followers, we check for sync on every 'progress' event
    if (!isLeader) {
      video.addEventListener('progress', syncToLeader);
    }

    // Cleanup
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', syncToLeader);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, isLeader, onTimeUpdate, syncTime]);

  return <video ref={videoRef} style={{ width: '100%', height: '100%' }} muted controls />;
});

export default VideoPlayer;
