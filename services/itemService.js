const db = require('../db/firestore');
const redisClient = require('../db/redis');
const metadataService = require('./metadataService');
const logger = require('../utils/logger');

if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error);
}

const getAllItem = async () => {
  const firestoreVersion = await metadataService.getVersion('items');
  const redisVersion = await redisClient.get('version:items');    
  try {    
    if (firestoreVersion && redisVersion && String(firestoreVersion) === String(redisVersion)) {
      logger.info('Using cached items from Redis');       
      const cachedItems = await redisClient.get('cache:items');        
        if (cachedItems) {            
            return JSON.parse(cachedGenres);
        }
    }else{
        logger.info('Fetching items from Firestore');
        const snapshot = await db.collection('items').get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        try {      
          if (firestoreVersion) {            
            await redisClient.set('cache:items', JSON.stringify(items));
            await redisClient.set('version:items', firestoreVersion);
          }
        } catch (error) {
            logger.error(`Redis error in getAllItems (set cache): ${error.message}`);
        }        
        return items;
        }
  } catch (error) {
      logger.error(`Redis error in getGenres: ${error.message}`);
      // Fallback to Firestore
  }
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
  getAllItem,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};