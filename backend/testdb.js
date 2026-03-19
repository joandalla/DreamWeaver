const mongoose = require('mongoose');
require('dotenv').config();

console.log('Verbindungs-URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Erfolgreich mit MongoDB verbunden!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Verbindungsfehler:', err);
  });