const express = require('express'),
      app = express(),
      db = require('./config/db'),
      cors = require('cors'),
      shortenUrlRoute = require('./routes/shortenUrlRoutes.js');

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware for cors policy
app.use(cors());

// shorten url routes
app.use('/api/shortenUrl', shortenUrlRoute);

// Error handling middleware
app.use((err, req, res, next) => { 
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 3000;
module.exports = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});