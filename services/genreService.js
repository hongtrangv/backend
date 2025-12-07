
const db = require('../db/firestore');
const redisClient = require('../db/redis');
const metadataService = require('./metadataService');
const logger = require('../utils/logger');

if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error);
}

const getGenres = async () => {
  try {
    const firestoreVersion = await metadataService.getVersion('genre');
    const redisVersion = await redisClient.get('version:genre');    
    if (firestoreVersion && redisVersion && firestoreVersion === redisVersion) {
        const cachedGenres = await redisClient.get('cache:genre');
        logger.info(`Using cached genres from Redis ${cachedGenres}`);
        if (cachedGenres) {
            logger.info('Fetching genres from Redis cache');
            return JSON.parse(cachedGenres);
        }
    }
  } catch (error) {
      logger.error(`Redis error in getGenres: ${error.message}`);
      // Fallback to Firestore
  }

  logger.info('Fetching genres from Firestore');
  const snapshot = await db.collection('genre').get();
  const genres = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  try {
      const firestoreVersion = await metadataService.getVersion('genre');
      if (firestoreVersion) {
        logger.info('Setting genre cache in Redis');
        await redisClient.set('cache:genre', JSON.stringify(genres));
        await redisClient.set('version:genre', firestoreVersion);
      }
  } catch (error) {
      logger.error(`Redis error in getGenres (set cache): ${error.message}`);
  }

  return genres;
};

const getGenreById = async (id) => {
  logger.info(`Fetching genre by id from Firestore: ${id}`);
  const doc = await db.collection('genre').doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

const createGenre = async (genreData) => {
    logger.info(`Creating new genre in Firestore ${JSON.stringify(genreData)}`);
    const docRef = await db.collection('genre').add(genreData);
    return { id: docRef.id, ...genreData };
};

const updateGenre = async (id, genreData) => {
    logger.info(`Updating genre in Firestore: ${id}`);
    await db.collection('genre').doc(id).update(genreData);
    return { id: id, ...genreData };
};

const deleteGenre = async (id) => {
    logger.info(`Deleting genre from Firestore: ${id}`);
    await db.collection('genre').doc(id).delete();
};


module.exports = {
  getGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
};
