// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
require('dotenv').config();

const app = express();

// CORS – erlaubt sowohl lokale Entwicklung als auch Produktions-Frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://dreamweaver-omega.vercel.app' // deine Vercel-Frontend-URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Nicht erlaubt von CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ========== HILFSFUNKTION: THUMBNAIL ==========
const generateThumbnail = async (base64Image) => {
  try {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const thumbnailBuffer = await sharp(buffer)
      .resize(200, 200, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toBuffer();
    return `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
  } catch (err) {
    console.error('Thumbnail-Fehler:', err);
    return base64Image;
  }
};

// ========== SCHEMAS ==========
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const dreamSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  colors: [String],
  params: Object,
  imageData: { type: String, required: true },
  imageDataThumb: { type: String },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
dreamSchema.index({ userId: 1 });
dreamSchema.index({ createdAt: -1 });

const likeSchema = new mongoose.Schema({
  dreamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dream', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});
likeSchema.index({ dreamId: 1, userId: 1 }, { unique: true });

const commentSchema = new mongoose.Schema({
  dreamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dream', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});
commentSchema.index({ dreamId: 1, createdAt: -1 });

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment'], required: true },
  dreamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dream', required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorEmail: { type: String, required: true },
  dreamTitle: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const User = mongoose.model('User', userSchema);
const Dream = mongoose.model('Dream', dreamSchema);
const Like = mongoose.model('Like', likeSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// ========== AUTH MIDDLEWARE ==========
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Nicht autorisiert' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    const user = await User.findById(decoded.userId).select('email');
    if (user) req.userEmail = user.email;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token ungültig' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin-Rechte erforderlich' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Fehler bei der Admin-Prüfung' });
  }
};

// ========== AUTH ROUTES ==========
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, role: 'user' });
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, userId: user._id, role: user.role });
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

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, userId: user._id, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// ========== DREAM ROUTES (privat) ==========
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
    const imageDataThumb = await generateThumbnail(imageData);
    const dream = new Dream({
      userId: req.userId,
      title,
      colors,
      params,
      imageData,
      imageDataThumb,
    });
    await dream.save();
    res.json(dream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

app.put('/api/dreams/:id', authenticate, async (req, res) => {
  try {
    const { title, colors, params, imageData } = req.body;
    const updateData = { title, colors, params };
    if (imageData) {
      updateData.imageData = imageData;
      updateData.imageDataThumb = await generateThumbnail(imageData);
    }
    const dream = await Dream.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
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
    await Like.deleteMany({ dreamId: req.params.id });
    await Comment.deleteMany({ dreamId: req.params.id });
    await Notification.deleteMany({ dreamId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

// ========== ÖFFENTLICHE ROUTEN ==========
app.get('/api/community/dreams', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const filter = search ? { title: { $regex: search, $options: 'i' } } : {};
    const dreams = await Dream.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title colors imageData imageDataThumb likeCount commentCount userId createdAt');
    res.json(dreams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Laden der Community-Bilder' });
  }
});

app.get('/api/dreams/public/:id', async (req, res) => {
  try {
    const dream = await Dream.findById(req.params.id)
      .select('title colors imageData imageDataThumb likeCount commentCount userId createdAt params');
    if (!dream) return res.status(404).json({ error: 'Traum nicht gefunden' });
    res.json(dream);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden des Traums' });
  }
});

// ========== LIKE ROUTES ==========
app.post('/api/likes/toggle', authenticate, async (req, res) => {
  try {
    const { dreamId } = req.body;
    const userId = req.userId;
    const dream = await Dream.findById(dreamId).populate('userId', 'email');
    if (!dream) return res.status(404).json({ error: 'Traum nicht gefunden' });

    const existing = await Like.findOne({ dreamId, userId });

    if (existing) {
      await existing.deleteOne();
      await Dream.findByIdAndUpdate(dreamId, { $inc: { likeCount: -1 } });
      await Notification.deleteOne({ dreamId, actorId: userId, type: 'like' });
      res.json({ liked: false });
    } else {
      const like = new Like({ dreamId, userId });
      await like.save();
      await Dream.findByIdAndUpdate(dreamId, { $inc: { likeCount: 1 } });

      if (dream.userId._id.toString() !== userId) {
        const notification = new Notification({
          userId: dream.userId._id,
          type: 'like',
          dreamId,
          actorId: userId,
          actorEmail: req.userEmail || 'Ein Nutzer',
          dreamTitle: dream.title,
        });
        await notification.save();
      }
      res.json({ liked: true });
    }
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Bereits geliked' });
    res.status(500).json({ error: 'Fehler beim Toggle' });
  }
});

app.get('/api/likes/status/:dreamId', authenticate, async (req, res) => {
  try {
    const { dreamId } = req.params;
    const userId = req.userId;
    const like = await Like.findOne({ dreamId, userId });
    res.json({ liked: !!like });
  } catch (err) {
    res.status(500).json({ error: 'Fehler' });
  }
});

app.get('/api/likes/count/:dreamId', async (req, res) => {
  try {
    const { dreamId } = req.params;
    const count = await Like.countDocuments({ dreamId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Fehler' });
  }
});

// ========== COMMENT ROUTES ==========
app.post('/api/comments', authenticate, async (req, res) => {
  try {
    const { dreamId, text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Kommentar darf nicht leer sein' });

    const dream = await Dream.findById(dreamId).populate('userId', 'email');
    if (!dream) return res.status(404).json({ error: 'Traum nicht gefunden' });

    const comment = new Comment({
      dreamId,
      userId: req.userId,
      text: text.trim(),
    });
    await comment.save();
    await comment.populate('userId', 'email');
    await Dream.findByIdAndUpdate(dreamId, { $inc: { commentCount: 1 } });

    if (dream.userId._id.toString() !== req.userId) {
      const notification = new Notification({
        userId: dream.userId._id,
        type: 'comment',
        dreamId,
        actorId: req.userId,
        actorEmail: req.userEmail || 'Ein Nutzer',
        dreamTitle: dream.title,
      });
      await notification.save();
    }

    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

app.get('/api/comments/:dreamId', async (req, res) => {
  try {
    const comments = await Comment.find({ dreamId: req.params.dreamId })
      .sort({ createdAt: -1 })
      .populate('userId', 'email');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden' });
  }
});

app.delete('/api/comments/:id', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Kommentar nicht gefunden' });
    if (comment.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Nicht berechtigt' });
    }
    await comment.deleteOne();
    await Dream.findByIdAndUpdate(comment.dreamId, { $inc: { commentCount: -1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

// ========== NOTIFICATION ROUTES ==========
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden' });
  }
});

app.post('/api/notifications/read/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Fehler' });
  }
});

app.post('/api/notifications/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Fehler' });
  }
});

// ========== PROFIL ROUTES ==========
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === 'undefined') return res.status(400).json({ error: 'Ungültige User-ID' });

    const user = await User.findById(userId).select('email role');
    if (!user) return res.status(404).json({ error: 'User nicht gefunden' });

    const dreams = await Dream.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('title imageData imageDataThumb likeCount commentCount createdAt');

    // Tägliche Statistiken
    const dailyStats = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const count = await Dream.countDocuments({ userId, createdAt: { $gte: date, $lt: nextDate } });
      dailyStats.push({ date: date.toISOString().split('T')[0], count });
    }

    const dreamIds = dreams.map(d => d._id);
    const likesReceived = dreamIds.length > 0
      ? await Like.countDocuments({ dreamId: { $in: dreamIds } })
      : 0;

    const commentsCount = await Comment.countDocuments({ userId });

    res.json({
      user: { email: user.email, _id: user._id, role: user.role },
      dreams,
      stats: { dreamsCount: dreams.length, likesReceived, commentsCount, daily: dailyStats },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Laden des Profils' });
  }
});

app.get('/api/profile/:userId/likes', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.userId) return res.status(403).json({ error: 'Nicht berechtigt' });

    const likes = await Like.find({ userId })
      .populate('dreamId', 'title imageDataThumb likeCount commentCount createdAt')
      .sort({ createdAt: -1 });
    res.json(likes);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Likes' });
  }
});

app.get('/api/profile/:userId/comments', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.userId) return res.status(403).json({ error: 'Nicht berechtigt' });

    const comments = await Comment.find({ userId })
      .populate('dreamId', 'title imageDataThumb')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Kommentare' });
  }
});

// ========== ADMIN ROUTEN ==========
app.get('/api/admin/dreams', authenticate, isAdmin, async (req, res) => {
  try {
    const dreams = await Dream.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'email role')
      .select('title imageDataThumb likeCount commentCount userId createdAt');
    res.json(dreams);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden' });
  }
});

app.delete('/api/admin/dreams/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const dream = await Dream.findById(req.params.id);
    if (!dream) return res.status(404).json({ error: 'Traum nicht gefunden' });
    await dream.deleteOne();
    await Like.deleteMany({ dreamId: req.params.id });
    await Comment.deleteMany({ dreamId: req.params.id });
    await Notification.deleteMany({ dreamId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ========== SERVER START ==========
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB verbunden');
    app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB Verbindungsfehler:', err);
    process.exit(1);
  });