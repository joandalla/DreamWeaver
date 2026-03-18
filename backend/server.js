const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// CORS-Konfiguration für Produktion und Entwicklung
const allowedOrigins = [
  'http://localhost:5173',
  'https://deine-frontend-domain.vercel.app' // Nach Deployment ersetzen
];

app.use(cors({
  origin: function (origin, callback) {
    // Erlaube Anfragen ohne Origin (z.B. mobile Apps, curl)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Nicht erlaubt von CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// MongoDB Verbindung
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB verbunden'))
  .catch(err => console.log('❌ MongoDB Fehler:', err));

// ========== SCHEMAS ==========
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const dreamSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  colors: [String],
  params: Object,
  imageData: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Dream = mongoose.model('Dream', dreamSchema);

// ========== AUTH MIDDLEWARE ==========
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Nicht autorisiert' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token ungültig' });
  }
};

// ========== AUTH ROUTES ==========
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(400).json({ error: 'Email existiert bereits' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Falsche Anmeldedaten' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Falsche Anmeldedaten' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// ========== DREAM ROUTES ==========
app.get('/api/dreams', authenticate, async (req, res) => {
  try {
    const dreams = await Dream.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(dreams);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden' });
  }
});

app.post('/api/dreams', authenticate, async (req, res) => {
  try {
    const { title, colors, params, imageData } = req.body;
    const dream = new Dream({
      userId: req.userId,
      title,
      colors,
      params,
      imageData,
    });
    await dream.save();
    res.json(dream);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

app.put('/api/dreams/:id', authenticate, async (req, res) => {
  try {
    const { title, colors, params, imageData } = req.body;
    const dream = await Dream.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, colors, params, imageData },
      { new: true }
    );
    res.json(dream);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});

app.delete('/api/dreams/:id', authenticate, async (req, res) => {
  try {
    await Dream.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

// ========== ÖFFENTLICHE ROUTE ==========
app.get('/api/community/dreams', async (req, res) => {
  try {
    const dreams = await Dream.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(dreams);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Community-Bilder' });
  }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));