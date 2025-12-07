const { MemoryDatabase } = require('../db/database');
const Logger = require('../utils/logger');

const db = new MemoryDatabase();

const getItems = (req, filters) => {
  req.logger.info('Fetching all items');
  return db.getAll(filters);
};

const getItemById = (req, id) => {
  req.logger.info(`Fetching item with id: ${id}`);
  return db.getById(id);
};

const createItem = (req, item) => {
  req.logger.info('Creating new item');
  return db.create(item);
};

const updateItem = (req, id, item) => {
  req.logger.info(`Updating item with id: ${id}`);
  return db.update(id, item);
};

const deleteItem = (req, id) => {
  req.logger.info(`Deleting item with id: ${id}`);
  return db.delete(id);
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};