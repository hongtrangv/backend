const express = require('express');
const router = express.Router();
const redisClient = require('../db/redis');
const ApiResponse = require('../utils/apiResponse');

// Get books from cache
router.get('/', async (req, res) => {
  const apiResponse = new ApiResponse(res);
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit || req.query.pagesize, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let books;
    const cachedBooks = await redisClient.get('cache:books');

    if (cachedBooks) {
      books = JSON.parse(cachedBooks);
    } else {
        // In a real application, you would fetch the data from your primary database here
        // and then cache it in Redis.
        books = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, title: `Book ${i + 1}` }));
        await redisClient.set('cache:books', JSON.stringify(books));
    }

    const paginatedBooks = books.slice(startIndex, endIndex);
    const totalPages = Math.ceil(books.length / limit);

    return apiResponse.success({
        totalPages,
        currentPage: page,
        totalItems: books.length,
        books: paginatedBooks,
    });
  } catch (err) {
    console.error(err);
    return apiResponse.error('Internal Server Error', 500);
  }
});

module.exports = router;
