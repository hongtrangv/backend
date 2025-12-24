const express = require('express');
const router = express.Router();
const itemService = require('../services/itemService');
const validate = require('../validators/itemValidator');
const { createItemRules, updateItemRules } = require('../models/item.model');
const { apiOk, apiError } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const metadataService = require('../services/metadataService');

// Get all items with filtering
router.get('/', async (req, res) => {
  try {
      const items = await itemService.getAllItem();
      apiOk(res, items);
   } catch (error) {
          logger.error(`Error fetching items: ${error.message}`);
          apiError(res, error.message);
      }
});

// Get a single item
router.get('/:id', async (req, res) => {
  try{
      const id = parseInt(req.params.id);
      const item = await itemService.getItemById(id);
      if (item) {
        apiOk(res, item);
      } else {
        apiError(res, 'Item not found', 404);
      }
  } catch (error) {
        logger.error(`Error fetching genres: ${error.message}`);
        apiError(res, error.message);
    }
});

// Create an item
router.post('/', validate(createItemRules()), async (req, res) => {
    try {
        const newItem = await itemService.createItem(req.body);
        await metadataService.updateVersion('items');
        logger.info(`New items created with id: ${newItem.id}`);
        apiOk(res, newItem, 'Item created successfully', 201);
    } catch (error) {
        logger.error(`Error creating items: ${error.message}`);
        apiError(res, error.message);
    }    
});

// Update an item
router.put('/:id', validate(updateItemRules()), async (req, res) => {
    try{
      const id = (req.params.id);
      const updatedItem = await itemService.updateItem(id, req.body);
      if (updatedItem) {
          await metadataService.updateVersion('items');
          apiOk(res, updatedItem);
      } else {
          apiError(res, 'Item not found', 404);
      }
      } catch (error) {
      logger.error(`Error update items: ${error.message}`);
      apiError(res, error.message);
    }   
});

// Delete an item
router.delete('/:id', async (req, res) => {
  try {
      const id = (req.params.id);
      const success = await itemService.deleteItem(id);
      if (success) {
        await metadataService.updateVersion('items');
        apiOk(res, null, 'Item deleted successfully', 204);
      } else {
        apiError(res, 'Item not found', 404);
      }
    } catch (error) {
          logger.error(`Error deleting items with id ${req.params.id}: ${error.message}`);
          apiError(res, error.message);
      }
});

module.exports = router;