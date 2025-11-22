import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

const streamUrls = [
  'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  'https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8',
  'https://pl.it-dev.info/node/free-hls-for-testing/chunks.m3u8',
  'https://pl.it-dev.info/node/free-hls-for-testing/chunks.m3u8',
  'https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8',
  'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
];

function App() {
  // State to hold the time of our leader video
  const [leaderTime, setLeaderTime] = useState(0);
  
  // An array of refs to hold references to each VideoPlayer component instance
  const playersRef = useRef([]);
  playersRef.current = [];

  const addToRefs = (el) => {
    if (el && !playersRef.current.includes(el)) {
      playersRef.current.push(el);
    }
  };

  // Handler for the leader video's time updates
  const handleLeaderTimeUpdate = (time) => {
    setLeaderTime(time);
  };

  const handlePlayAll = () => {
    playersRef.current.forEach(player => player && player.play());
  };

  const handlePauseAll = () => {
    playersRef.current.forEach(player => player && player.pause());
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Synchronized Video Streaming Dashboard</h1>
      
      {/* Global Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button onClick={handlePlayAll} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Play All
        </button>
        <button onClick={handlePauseAll} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Pause All
        </button>
      </div>

      {/* Responsive Grid for Video Players */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {streamUrls.map((url, index) => (
          <div key={index} className="bg-black rounded-lg overflow-hidden shadow-lg">
            <VideoPlayer
              ref={addToRefs} // Add this instance to our array of refs
              src={url}
              isLeader={index === 0} // The first video is the leader
              onTimeUpdate={index === 0 ? handleLeaderTimeUpdate : null} // Only the leader reports its time
              syncTime={leaderTime} // All players receive the leader's time
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
