require('dotenv').config();
const express = require('express');
const auditLog = require('./middleware/auditLog');
const basicAuth = require('./middleware/basicAuth'); // Import basicAuth
const itemRoutes = require('./routes/items');
const genreRoutes = require('./routes/genre');
const metaDataRoutes = require('./routes/metadata');
const bookRoutes = require('./routes/books'); // Import the new book routes
const searchRoutes = require('./routes/search');
const redisClient = require('./db/redis');
const spendindRoutes = require('./routes/spending');
const authRoutes = require('./routes/auth'); // Import the new auth routes
const userRoutes = require('./routes/user'); // Import the new user routes
const taskRoutes = require('./routes/tasks'); // Import the new task routes
const menuRoutes = require('./routes/menu'); // Import the new menu routes

// const db = require('./db/firestore');

const app = express();
const port = 3000;

// Connect to Redis
redisClient.connect().catch(console.error);

// Apply middlewares
app.use(express.json()); // Body parser should come early
app.use(auditLog); // For logging all requests

// Root route (does not require auth)
app.get('/', (req, res) => {
  res.send('Hello World! Your app is now refactored!');
});



// Apply basic authentication to all other API routes
app.use('/api', basicAuth);

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/metadata', metaDataRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/spending',spendindRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/menu', menuRoutes); // Add menu routes
// Auth and User routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
