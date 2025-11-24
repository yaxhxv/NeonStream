import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

function App() {
  const [streamUrls, setStreamUrls] = useState([]);
  const [leaderTime, setLeaderTime] = useState(0);
  const playersRef = useRef([]);

  useEffect(() => {
    fetch('/api/streams')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const urls = data.map(item => item.url);
        setStreamUrls(urls);
      })
      .catch(error => console.error('Error fetching streams:', error));
  }, []);

  // Using useCallback to ensure the ref callback doesn't change on every render,
  // which was causing the VideoPlayer components to unmount and remount.
  const addToRefs = useCallback((el) => {
    if (el && !playersRef.current.includes(el)) {
      playersRef.current.push(el);
    }
  }, []);

  const handleLeaderTimeUpdate = useCallback((time) => {
    setLeaderTime(time);
  }, []);

  const handlePlayAll = () => {
    playersRef.current.forEach(player => player && player.play());
  };

  const handlePauseAll = () => {
    playersRef.current.forEach(player => player && player.pause());
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Synchronized Video Streaming Dashboard</h1>
      
      <div className="flex justify-center space-x-4 mb-6">
        <button onClick={handlePlayAll} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Play All
        </button>
        <button onClick={handlePauseAll} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Pause All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {streamUrls.map((url, index) => (
          <div key={url} className="bg-black rounded-lg overflow-hidden shadow-lg">
            <VideoPlayer
              ref={addToRefs}
              src={url}
              isLeader={index === 0}
              onTimeUpdate={index === 0 ? handleLeaderTimeUpdate : null}
              syncTime={leaderTime}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
