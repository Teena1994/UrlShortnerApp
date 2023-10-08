const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config({path: '../.env'});

const { MONGODB_URI } = process.env;
console.log(`Trying to connect to ${MONGODB_URI}`);
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });







