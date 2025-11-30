// index.js
const express = require('express');
const cors = require('cors');
const buildingsRoute = require('./buildings');
const app = express();
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 3000; // Use PORT from environment or default to 3000

// Middleware
app.use(express.json());
app.use(cors());

// API Key verification middleware (Optional: You might want to skip this for the root route to see if it's running)
app.use((req, res, next) => {
  // Skip auth for root route so health checks pass
  if (req.path === '/') return next();

  const apiKey = req.headers['authorization'];
  
  // Only check if API_KEY is set in env, otherwise warn (or skip for dev)
  if (API_KEY && apiKey !== API_KEY) {
    return res.status(403).send({ error: 'Forbidden' });
  }
  
  next();
});

// Routes
app.use('/api/buildings', buildingsRoute);

// Default route
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Only start listening if we are running this file directly (not required by Vercel, but needed for Render)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
