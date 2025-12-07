
const express = require('express');
const router = express.Router();
const genreService = require('../services/genreService');
const metadataService = require('../services/metadataService');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// GET all genres
router.get('/', async (req, res) => {
    const response = new ApiResponse(res);
    try {
        const genres = await genreService.getGenres();
        response.success(genres);
    } catch (error) {
        logger.error(`Error fetching genres: ${error.message}`);
        response.error(error.message);
    }
});

// GET a genre by id
router.get('/:id', async (req, res) => {
    const response = new ApiResponse(res);
    try {
        const genre = await genreService.getGenreById(req.params.id);
        if (!genre) {
            logger.warn(`Genre not found with id: ${req.params.id}`);
            return response.notFound("Genre not found");
        }
        response.success(genre);
    } catch (error) {
        logger.error(`Error fetching genre with id ${req.params.id}: ${error.message}`);
        response.error(error.message);
    }
});

// CREATE a new genre
router.post('/', async (req, res) => {
    const response = new ApiResponse(res);
    try {
        const newGenre = await genreService.createGenre(req.body);
        await metadataService.updateVersion('genre');
        logger.info(`New genre created with id: ${newGenre.id}`);
        response.created(newGenre);
    } catch (error) {
        logger.error(`Error creating genre: ${error.message}`);
        response.error(error.message);
    }
});

// UPDATE a genre
router.put('/:id', async (req, res) => {
    const response = new ApiResponse(res);
    try {
        const updatedGenre = await genreService.updateGenre(req.params.id, req.body);
        await metadataService.updateVersion('genre');
        logger.info(`Genre with id: ${req.params.id} updated`);
        response.success(updatedGenre);
    } catch (error) {
        logger.error(`Error updating genre with id ${req.params.id}: ${error.message}`);
        response.error(error.message);
    }
});

// DELETE a genre
router.delete('/:id', async (req, res) => {
    const response = new ApiResponse(res);
    try {
        await genreService.deleteGenre(req.params.id);
        await metadataService.updateVersion('genre');
        logger.info(`Genre with id: ${req.params.id} deleted`);
        response.success({ message: "Genre deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting genre with id ${req.params.id}: ${error.message}`);
        response.error(error.message);
    }
});

module.exports = router;
