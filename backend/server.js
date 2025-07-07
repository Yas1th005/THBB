require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./models');
const orderRoutes = require('./routes/order.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', require('./routes'));
app.use('/api/orders', orderRoutes);
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/analytics', require('./routes/analytics'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the backend API' });
});

// Socket.IO setup
require('./socket')(io);

// Database connection
db.sequelize.sync()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});






