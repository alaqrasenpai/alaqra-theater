const express = require('express');
const cors = require('cors');
const torrentRoutes = require('./routes/torrent');
const searchRoutes = require('./routes/search');
const subtitleRoutes = require('./routes/subtitles');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/torrent', torrentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/subtitles', subtitleRoutes);

app.get('/', (req, res) => {
  res.send('Movie Streaming Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
