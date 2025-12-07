
const express = require('express');
const router = express.Router();
const genreService = require('../services/genreService');
const metadataService = require('../services/metadataService');
const { apiResponse } = require('../utils/apiResponse');

// GET all genres
router.get('/', async (req, res) => {
  try {
    const genres = await genreService.getGenres();
    res.status(200).json(apiResponse(genres));
  } catch (error) {
    res.status(500).json(apiResponse(null, error.message));
  }
});

// GET a genre by id
router.get('/:id', async (req, res) => {
    try {
        const genre = await genreService.getGenreById(req.params.id);
        if (!genre) {
            return res.status(404).json(apiResponse(null, "Genre not found"));
        }
        res.status(200).json(apiResponse(genre));
    } catch (error) {
        res.status(500).json(apiResponse(null, error.message));
    }
});

// CREATE a new genre
router.post('/', async (req, res) => {
    try {
        const newGenre = await genreService.createGenre(req.body);
        await metadataService.updateVersion('genre');
        res.status(201).json(apiResponse(newGenre));
    } catch (error) {
        res.status(500).json(apiResponse(null, error.message));
    }
});

// UPDATE a genre
router.put('/:id', async (req, res) => {
    try {
        const updatedGenre = await genreService.updateGenre(req.params.id, req.body);
        await metadataService.updateVersion('genre');
        res.status(200).json(apiResponse(updatedGenre));
    } catch (error) {
        res.status(500).json(apiResponse(null, error.message));
    }
});

// DELETE a genre
router.delete('/:id', async (req, res) => {
    try {
        await genreService.deleteGenre(req.params.id);
        await metadataService.updateVersion('genre');
        res.status(200).json(apiResponse({ message: "Genre deleted successfully" }));
    } catch (error) {
        res.status(500).json(apiResponse(null, error.message));
    }
});

module.exports = router;
