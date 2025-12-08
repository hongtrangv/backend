const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const embeddingService = require('../services/embeddingService');
const bookService = require('../services/bookService');
const axios = require('axios');
const logger = require('../utils/logger');

router.get('/', async (req, res) => {
  const apiResponse = new ApiResponse(res);
  try {
    const query = req.query.q;
    if (!query) {
      return apiResponse.error('Search query is required', 400);
    }

    // 1. Perform search using the embedding service on local data
    const searchResults = await embeddingService.searchBooksByEmbedding(query);

    // Define a minimum threshold for relevance. Since embeddings are random,
    // this helps prevent completely irrelevant results from being returned.
    const relevanceThreshold = 0.1;
    const relevantResults = searchResults.filter(r => r.score > relevanceThreshold);

    if (relevantResults.length > 0) {
      logger.info(`Found ${relevantResults.length} relevant results from local embedding search.`);
      const allBooks = await bookService.getBooks();
      const booksMap = new Map(allBooks.map(book => [String(book.id), book]));

      const enrichedResults = relevantResults
        .map(result => {
          const bookDetails = booksMap.get(result.bookId);
          if (bookDetails) {
            return {
              ...bookDetails,
              searchScore: result.score,
              source: 'local_embedding_search'
            };
          }
          return null;
        })
        .filter(Boolean);

      if (enrichedResults.length > 0) {
        return apiResponse.success(enrichedResults);
      }
    }

    // 2. If no relevant local results, fallback to Google Books API
    logger.info('No relevant local results found. Falling back to Google Books API.');
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);

    if (!response.data.items) {
      return apiResponse.success([]); // No results from Google either
    }

    const books = response.data.items.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors,
      publisher: item.volumeInfo.publisher,
      publishedDate: item.volumeInfo.publishedDate,
      description: item.volumeInfo.description,
      source: 'google_books_api'
    }));

    return apiResponse.success(books);

  } catch (err) {
    logger.error(`Search failed: ${err.message}`);
    return apiResponse.error('Internal Server Error', 500);
  }
});

module.exports = router;
