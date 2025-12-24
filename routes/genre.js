
const express = require('express');
const router = express.Router();
const genreService = require('../services/genreService');
const metadataService = require('../services/metadataService');
const { apiOk, apiError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// GET all genres
router.get('/', async (req, res) => {
    try {
        const genres = await genreService.getGenres();
        apiOk(res, genres);
    } catch (error) {
        logger.error(`Error fetching genres: ${error.message}`);
        apiError(res, error.message);
    }
});

// GET a genre by id
router.get('/:id', async (req, res) => {
    try {
        const genre = await genreService.getGenreById(req.params.id);
        if (!genre) {
            logger.warn(`Genre not found with id: ${req.params.id}`);
            return apiError(res, "Genre not found", 404);
        }
        apiOk(res, genre);
    } catch (error) {
        logger.error(`Error fetching genre with id ${req.params.id}: ${error.message}`);
        apiError(res, error.message);
    }
});

// CREATE a new genre
router.post('/', async (req, res) => {
    try {
        const newGenre = await genreService.createGenre(req.body);
        await metadataService.updateVersion('genre');
        logger.info(`New genre created with id: ${newGenre.id}`);
        apiOk(res, newGenre, 'Genre created successfully', 201);
    } catch (error) {
        logger.error(`Error creating genre: ${error.message}`);
        apiError(res, error.message);
    }
});

// UPDATE a genre
router.put('/:id', async (req, res) => {
    try {
        const updatedGenre = await genreService.updateGenre(req.params.id, req.body);
        await metadataService.updateVersion('genre');
        logger.info(`Genre with id: ${req.params.id} updated`);
        apiOk(res, updatedGenre);
    } catch (error) {
        logger.error(`Error updating genre with id ${req.params.id}: ${error.message}`);
        apiError(res, error.message);
    }
});

// DELETE a genre
router.delete('/:id', async (req, res) => {
    try {
        await genreService.deleteGenre(req.params.id);
        await metadataService.updateVersion('genre');
        logger.info(`Genre with id: ${req.params.id} deleted`);
        apiOk(res, { message: "Genre deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting genre with id ${req.params.id}: ${error.message}`);
        apiError(res, error.message);
    }
});

module.exports = router;
