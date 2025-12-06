require('dotenv').config();
const express = require('express');
const auditLog = require('./middleware/auditLog');
const itemRoutes = require('./routes/items');
const bookRoutes = require('./routes/books'); // Import the new book routes
const redisClient = require('./db/redis');
// const db = require('./db/firestore');

const app = express();
const port = 3000;

// Connect to Redis
redisClient.connect().catch(console.error);

// Apply middlewares
app.use(auditLog);
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Hello World! Your app is now refactored!');
});

// Use the item routes
app.use('/api/items', itemRoutes);

// Use the book routes
app.use('/api/books', bookRoutes); // Use the new book routes

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
