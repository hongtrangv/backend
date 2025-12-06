const express = require('express');
const router = express.Router();
const redisClient = require('../db/redis');

// Get books from cache
router.get('/', async (req, res) => {
  try {
    const cachedBooks = await redisClient.get('cache:book');
    if (cachedBooks) {
      res.send(JSON.parse(cachedBooks));
    } else {
        // In a real application, you would fetch the data from your primary database here
        // and then cache it in Redis.
        const books = [{ id: 1, title: 'Book 1' }]; // placeholder
        await redisClient.set('cache:book', JSON.stringify(books));
        res.send(books);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;