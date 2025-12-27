const express = require('express');
const router = express.Router();
const menuService = require('../services/menuService');
const { apiOk, apiError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Create a new menu
router.post('/', async (req, res) => {
    try {
        const { name, icon, path, permissions } = req.body;
        const newMenu = await menuService.addMenu(name, icon, path, permissions);
        apiOk(res, newMenu, 'Menu created successfully');
    } catch (error) {
        logger.error(`Error creating menu: ${error.message}`);
        apiError(res, error.message);
    }
});

// Update a menu
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedMenu = await menuService.updateMenu(id, req.body);
        if (updatedMenu) {
            apiOk(res, updatedMenu, 'Menu updated successfully');
        } else {
            apiError(res, 'Menu not found', 404);
        }
    } catch (error) {
        logger.error(`Error updating menu: ${error.message}`);
        apiError(res, error.message);
    }
});

module.exports = router;
