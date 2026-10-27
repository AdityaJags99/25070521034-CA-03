// FLEXI backend entry point: starts Express, connects to MongoDB, mounts the API routes.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const sanitize = require('./middleware/sanitize');
const { notFound, errorHandler } = require('./middleware/error');

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error('Missing MONGO_URI or JWT_SECRET. Copy server/.env.example to server/.env first.');
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((s) => s.trim()),
}));
app.use(express.json({ limit: '1mb' }));
app.use(sanitize);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/freelancers', require('./routes/freelancerRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api', require('./routes/publicRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`FLEXI API running on http://localhost:${PORT}`));
});
