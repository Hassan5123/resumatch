const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dbConnection = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');
dotenv.config();

const userRoutes = require('./routes/user');

dbConnection();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);

// Error handling middleware after routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
// Added Error Handling to understand any server start-up related errors
const server = app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});