const express = require('express');
const router = express.Router();
const itemService = require('../services/itemService');
const validate = require('../validators/itemValidator');
const { createItemRules, updateItemRules } = require('../models/item.model');
const ApiResponse = require('../utils/apiResponse');

// Get all items with filtering
router.get('/', async (req, res) => {
  const response = new ApiResponse(res);
  const items = await itemService.getItems(req.query);
  response.success(items);
});

// Get a single item
router.get('/:id', async (req, res) => {
  const response = new ApiResponse(res);
  const id = parseInt(req.params.id);
  const item = await itemService.getItemById(id);
  if (item) {
    response.success(item);
  } else {
    response.notFound('Item not found');
  }
});

// Create an item
router.post('/', validate(createItemRules()), async (req, res) => {
    const response = new ApiResponse(res);
    // The body is already sanitized by the validator
    const newItem = await itemService.createItem(req.body);
    response.created(newItem);
});

// Update an item
router.put('/:id', validate(updateItemRules()), async (req, res) => {
    const response = new ApiResponse(res);
    const id = parseInt(req.params.id);
    const updatedItem = await itemService.updateItem(id, req.body);
    if (updatedItem) {
        response.success(updatedItem);
    } else {
        response.notFound('Item not found');
    }
});

// Delete an item
router.delete('/:id', async (req, res) => {
  const response = new ApiResponse(res);
  const id = parseInt(req.params.id);
  const success = await itemService.deleteItem(id);
  if (success) {
    response.noContent();
  } else {
    response.notFound('Item not found');
  }
});

module.exports = router;