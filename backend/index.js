const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001; // Port for our backend server

app.use(cors()); // Keep cors for safety

// The endpoint that returns the list of HLS stream URLs
app.get('/api/streams', (req, res) => {
  // Generate relative URLs that will be proxied by the frontend server
  const streams = [
    { id: 1, url: '/hls/stream1/index.m3u8' },
    { id: 2, url: '/hls/stream2/index.m3u8' },
    { id: 3, url: '/hls/stream3/index.m3u8' },
    { id: 4, url: '/hls/stream4/index.m3u8' },
    { id: 5, url: '/hls/stream5/index.m3u8' },
    { id: 6, url: '/hls/stream6/index.m3u8' },
  ];
  res.json(streams);
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
