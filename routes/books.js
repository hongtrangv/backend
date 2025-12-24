const express = require('express');
const router = express.Router();
const bookService = require('../services/bookService');
const { apiOk, apiError } = require('../utils/apiResponse');

// Get books from cache
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit || req.query.pagesize, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const books = await bookService.getBooks();

    const paginatedBooks = books.slice(startIndex, endIndex);
    const totalPages = Math.ceil(books.length / limit);

    apiOk(res, {
        totalPages,
        currentPage: page,
        totalItems: books.length,
        books: paginatedBooks,
    });
  } catch (err) {
    console.error(err);
    apiError(res, 'Internal Server Error', 500);
  }
});

module.exports = router;