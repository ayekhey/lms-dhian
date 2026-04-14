const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const diagnosticRoutes = require('./routes/diagnosticRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const userRoutes = require('./routes/userRoutes');
const postTestRoutes = require('./routes/postTestRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL (Vite default)
  credentials: true
}));
app.use(express.json());
app.use('/static', express.static('src/uploads')); // Serve uploaded files
app.use('/api/users', userRoutes);

// Health check route - just to confirm server is running
app.get('/', (req, res) => {
  res.json({ message: 'LMS API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/posttest', postTestRoutes);

module.exports = app;