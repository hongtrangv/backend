
const express = require('express');
const auditLog = require('./middleware/auditLog');
const itemRoutes = require('./routes/items');

const app = express();
const port = 3000;

// Apply middlewares
app.use(auditLog);
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Hello World! Your app is now refactored!');
});

// Use the item routes
app.use('/api/items', itemRoutes);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
