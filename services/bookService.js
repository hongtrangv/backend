const db = require('../db/firestore');
const redisClient = require('../db/redis');
const metadataService = require('./metadataService');
const logger = require('../utils/logger');
const embeddingService = require('./embeddingService');

if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error);
}

const getBooks = async () => {
  const firestoreVersion = await metadataService.getVersion('books');
  const redisVersion = await redisClient.get('version:books');
  try {
    if (firestoreVersion && redisVersion && String(firestoreVersion) === String(redisVersion)) {
      logger.info('Using cached books from Redis');
      const cachedBooks = await redisClient.get('cache:books');
        if (cachedBooks) {
            return JSON.parse(cachedBooks);
        }
    }else{
        logger.info('Fetching books from Firestore');
        const snapshot = await db.collection('books').get();
        const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        try {
          if (firestoreVersion) {
            await redisClient.set('cache:books', JSON.stringify(books));
            await redisClient.set('version:books', firestoreVersion);
            // After caching the books, create the embeddings
            await embeddingService.createBookEmbeddings(books);
          }
        } catch (error) {
            logger.error(`Redis error in getBooks (set cache): ${error.message}`);
        }
        return books;
        }
  } catch (error) {
      logger.error(`Redis error in getBooks: ${error.message}`);
      // Fallback to Firestore
      const snapshot = await db.collection('books').get();
      const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return books;
  }

};

const getBookById = async (id) => {
  logger.info(`Fetching book by id from Firestore: ${id}`);
  const doc = await db.collection('books').doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

const createBook = async (bookData) => {
    logger.info(`Creating new book in Firestore ${JSON.stringify(bookData)}`);
    const docRef = await db.collection('books').add(bookData);
    const newBook = { id: docRef.id, ...bookData };
    await embeddingService.createSingleBookEmbedding(newBook); // Create embedding for the new book
    await metadataService.updateVersion('books'); // Invalidate cache
    return newBook;
};

const updateBook = async (id, bookData) => {
    logger.info(`Updating book in Firestore: ${id}`);
    await db.collection('books').doc(id).update(bookData);
    const updatedBook = { id: id, ...bookData };
    await embeddingService.createSingleBookEmbedding(updatedBook); // Update embedding for the book
    await metadataService.updateVersion('books'); // Invalidate cache
    return updatedBook;
};

const deleteBook = async (id) => {
    logger.info(`Deleting book from Firestore: ${id}`);
    await db.collection('books').doc(id).delete();
    await embeddingService.deleteBookEmbedding(id); // Delete the book's embedding
    await metadataService.updateVersion('books'); // Invalidate cache
};


module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};