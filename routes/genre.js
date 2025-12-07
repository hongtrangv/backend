
const express = require('express');
const router = express.Router();
const genreService = require('../services/genreService');
const { apiResponse } = require('../utils/apiResponse');

router.get('/', async (req, res) => {
  try {
    const genres = await genreService.getGenres();
    res.status(200).json(apiResponse(genres));
  } catch (error) {
    res.status(500).json(apiResponse(null, error.message));
  }
});

module.exports = router;
