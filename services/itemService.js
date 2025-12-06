const { MemoryDatabase } = require('../db/database');

const db = new MemoryDatabase();

const getItems = (filters) => {
  return db.getAll(filters);
};

const getItemById = (id) => {
  return db.getById(id);
};

const createItem = (item) => {
  return db.create(item);
};

const updateItem = (id, item) => {
  return db.update(id, item);
};

const deleteItem = (id) => {
  return db.delete(id);
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};