require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
// Render provides the PORT environment variable
const port = process.env.PORT || 3001;

// Whitelist of allowed origins
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend
  'https://neon-stream.web.app' // Your deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

// This should be the public URL of your mediamtx service
const mediamtxUrl = process.env.MEDIAMTX_URL;

app.get('/api/streams', (req, res) => {
  if (!mediamtxUrl) {
    return res.status(500).json({ error: 'MEDIAMTX_URL is not configured' });
  }

  // These stream names should match the paths in your mediamtx.yml
  const streamPaths = [
    'stream1',
    'stream2',
    'stream3',
    'stream4',
    'stream5',
    'stream6',
  ];

  const streams = streamPaths.map((path, index) => ({
    id: index + 1,
    url: `${mediamtxUrl}/hls/${path}/index.m3u8`,
  }));

  res.json(streams);
});

app.listen(port, () => {
  console.log(`Backend server listening at port ${port}`);
});
