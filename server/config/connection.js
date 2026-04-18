const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_DB_URL
, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.once('open', () => console.log('✅ MongoDB connected successfully'));

db.on('error', (err) => console.error('❌ MongoDB connection error:', err));

db.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));

module.exports = db;

