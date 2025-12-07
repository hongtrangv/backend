const express = require('express');
const router = express.Router();
const itemService = require('../services/itemService');
const validate = require('../validators/itemValidator');
const { createItemRules, updateItemRules } = require('../models/item.model');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Get all items with filtering
router.get('/', async (req, res) => {
  const response = new ApiResponse(res);
  try {
      const items = await itemService.getAllItems();
      response.success(items);
   } catch (error) {
          logger.error(`Error fetching items: ${error.message}`);
          response.error(error.message);
      }
});

// Get a single item
router.get('/:id', async (req, res) => {
  const response = new ApiResponse(res);
  try{
      const id = parseInt(req.params.id);
      const item = await itemService.getItemById(id);
      if (item) {
        response.success(item);
      } else {
        response.notFound('Item not found');
      }
  } catch (error) {
        logger.error(`Error fetching genres: ${error.message}`);
        response.error(error.message);
    }
});

// Create an item
router.post('/', validate(createItemRules()), async (req, res) => {
    const response = new ApiResponse(res);    
    try {
        const newItem = await itemService.createItem(req.body);
        await metadataService.updateVersion('items');
        logger.info(`New items created with id: ${newItem.id}`);
        response.created(nnewItem);
    } catch (error) {
        logger.error(`Error creating items: ${error.message}`);
        response.error(error.message);
    }    
});

// Update an item
router.put('/:id', validate(updateItemRules()), async (req, res) => {
    const response = new ApiResponse(res);
    try{
      const id = (req.params.id);
      const updatedItem = await itemService.updateItem(id, req.body);      
      if (updatedItem) {
          await metadataService.updateVersion('items');
          response.success(updatedItem);
      } else {
          response.notFound('Item not found');
      }
      } catch (error) {
      logger.error(`Error update items: ${error.message}`);
      response.error(error.message);
    }   
});

// Delete an item
router.delete('/:id', async (req, res) => {
  const response = new ApiResponse(res);
  try {
      const id = (req.params.id);
      const success = await itemService.deleteItem(id);
      if (success) {
        await metadataService.updateVersion('items');
        response.noContent();
      } else {
        response.notFound('Item not found');
      }
    } catch (error) {
          logger.error(`Error deleting items with id ${req.params.id}: ${error.message}`);
          response.error(error.message);
      }
});

module.exports = router;