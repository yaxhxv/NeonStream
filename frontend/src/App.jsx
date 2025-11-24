import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

function App() {
  const [streamUrls, setStreamUrls] = useState([]);
  const [leaderTime, setLeaderTime] = useState(0);
  // Default to system preference, then allow user to override
  const [theme, setTheme] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const playersRef = useRef([]);

  // Effect to apply the theme class to the body
  useEffect(() => {
    const body = window.document.body;
    body.classList.remove('light', 'dark');
    body.classList.add(theme);
  }, [theme]);

  // Effect to fetch stream URLs
  useEffect(() => {
    fetch('/api/streams')
      .then(response => response.json())
      .then(data => setStreamUrls(data.map(item => item.url)))
      .catch(error => console.error('Error fetching streams:', error));
  }, []);

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

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen font-sans">
      <header className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            SyncStream Dashboard
          </h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
          >
            Toggle Theme
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center space-x-4 mb-6">
            <button 
              onClick={handlePlayAll} 
              className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900"
            >
              Play All
            </button>
            <button 
              onClick={handlePauseAll} 
              className="px-6 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900"
            >
              Pause All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {streamUrls.map((url) => (
              <div key={url} className="bg-black rounded-lg overflow-hidden shadow-2xl aspect-video">
                <VideoPlayer
                  ref={addToRefs}
                  src={url}
                  isLeader={url === streamUrls[0]}
                  onTimeUpdate={url === streamUrls[0] ? handleLeaderTimeUpdate : null}
                  syncTime={leaderTime}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
