const { MemoryDatabase } = require('../db/database');
const logger = require('../utils/logger');

const db = new MemoryDatabase();

const getItems = (filters) => {
  logger.info('Fetching all items');
  return db.getAll(filters);
};

const getItemById = (id) => {
  logger.info(`Fetching item with id: ${id}`);
  return db.getById(id);
};

const createItem = (req, item) => {
  logger.info('Creating new item');
  return db.create(item);
};

const updateItem = (id, item) => {
  logger.info(`Updating item with id: ${id}`);
  return db.update(id, item);
};

const deleteItem = (id) => {
  logger.info(`Deleting item with id: ${id}`);
  return db.delete(id);
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};