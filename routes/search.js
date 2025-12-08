
const express = require('express');
const router = express.Router();
const redisClient = require('../db/redis');
const ApiResponse = require('../utils/apiResponse');
const axios = require('axios');

router.get('/', async (req, res) => {
  const apiResponse = new ApiResponse(res);
  try {
    const query = req.query.q;
    if (!query) {
      return apiResponse.error('Search query is required', 400);
    }

    const cacheKey = `cache:books:${query}`;
    const cachedResults = await redisClient.get(cacheKey);

    if (cachedResults) {
      return apiResponse.success(JSON.parse(cachedResults));
    } else {
      // Search on the internet (e.g., Google Books API)
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
      const books = response.data.items.map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        publisher: item.volumeInfo.publisher,
        publishedDate: item.volumeInfo.publishedDate,
        description: item.volumeInfo.description,
      }));

      await redisClient.set(cacheKey, JSON.stringify(books));
      return apiResponse.success(books);
    }
  } catch (err) {
    console.error(err);
    return apiResponse.error('Internal Server Error', 500);
  }
});

module.exports = router;
