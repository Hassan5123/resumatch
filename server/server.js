const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dbConnection = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');
dotenv.config();

// Import routes
const userRoutes = require('./routes/user');
const resumeRoutes = require('./routes/resume');
const testRoutes = require('./routes/test');

dbConnection();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/test', testRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware - MUST come after all routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Server startup with error handling
const server = app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});




// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const dbConnection = require('./config/database');
// const { notFound, errorHandler } = require('./middleware/errorHandler');
// dotenv.config();

// const userRoutes = require('./routes/user');
// const resumeRoutes = require('./routes/resume');

// dbConnection();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// app.use('/api/user', userRoutes);
// app.use('/api/resume', resumeRoutes);

// // Error handling middleware - MUST come after all routes
// app.use(notFound);
// app.use(errorHandler);

// // Server startup with error handling
// const PORT = process.env.PORT || 5001;
// const server = app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
// server.on('error', (err) => {
//   console.error('Server failed to start:', err);
//   process.exit(1);
// });