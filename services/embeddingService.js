require('dotenv').config();
const redisClient = require('../db/redis');
const logger = require('../utils/logger');

// A singleton class to manage the embedding pipeline, so we only load the model once.
class EmbeddingPipeline {
    static instance = null;

    static async getInstance() {
        if (this.instance === null) {
            // Use dynamic import to load the module
            const { pipeline } = await import('@xenova/transformers');
            this.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
        return this.instance;
    }
}

// Calculates the cosine similarity between two vectors.
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB) return 0;
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
};

class EmbeddingService {

  async #connectToRedis() {
    if (!redisClient.isReady) {
      await redisClient.connect();
    }
  }

  // Generates embeddings for a batch of texts using the local model.
  async #generateEmbeddings(texts) {
    try {
      const extractor = await EmbeddingPipeline.getInstance();
      const output = await extractor(texts, { pooling: 'mean', normalize: true });
      return output.tolist();
    } catch (error) {
      logger.error(`Failed to generate embeddings: ${error.message}`);
      throw error;
    }
  }
  
  async createSingleBookEmbedding(book) {
    if (!book || !book.id) {
        logger.info('No book or book ID provided to create a single embedding.');
        return;
    }

    await this.#connectToRedis();
    logger.info(`Generating embedding for single book ID: ${book.id}`);

    const parts = [];
    if (book.title) parts.push(`Title: ${book.title}`);
    if (book.genre) parts.push(`Genre: ${book.genre}`);
    if (book.description) parts.push(`Description: ${book.description}`);
    if (book.author) parts.push(`Author: ${book.author}`);
    const text = parts.join(', ');

    const [embedding] = await this.#generateEmbeddings([text]);

    if (embedding) {
        await redisClient.hSet('book_embeddings', `book:${book.id}`, JSON.stringify(embedding));
        logger.info(`Embedding stored for book ID: ${book.id}`);
    } else {
        logger.warn(`Could not generate embedding for book ID: ${book.id}`);
    }
  }

  async deleteBookEmbedding(bookId) {
    if (!bookId) {
        logger.warn('No book ID provided to delete embedding.');
        return;
    }
    await this.#connectToRedis();
    await redisClient.hDel('book_embeddings', `book:${bookId}`);
    logger.info(`Embedding deleted for book ID: ${bookId}`);
  }

  async createBookEmbeddings(books) {
    if (!books || books.length === 0) {
        logger.info('No books provided to create embeddings.');
        return;
    }

    await this.#connectToRedis();
    logger.info(`Generating embeddings for ${books.length} books...`);

    // Process books in smaller batches to conserve memory
    const batchSize = 10;
    for (let i = 0; i < books.length; i += batchSize) {
        const batchBooks = books.slice(i, i + batchSize);
        logger.info(`Processing batch of ${batchBooks.length} books...`);
        logger.info(`Total books: ${i * batchSize}`);
        const texts = batchBooks.map(book => {
            const parts = [];
            if (book.title) parts.push(`Title: ${book.title}`);
            if (book.genre) parts.push(`Genre: ${book.genre}`);
            if (book.description) parts.push(`Description: ${book.description}`);
            if (book.author) parts.push(`Author: ${book.author}`);
            return parts.join(', ');
        });

        const embeddings = await this.#generateEmbeddings(texts);
        
        const multi = redisClient.multi();
        batchBooks.forEach((book, index) => {
            if (embeddings[index]) {
                multi.hSet('book_embeddings', `book:${book.id}`, JSON.stringify(embeddings[index]));
            }
        });

        await multi.exec();
        logger.info(`Batch of ${batchBooks.length} books processed and embeddings stored.`);
    }

    logger.info('All book embeddings have been recreated.');
  }


  async searchBooksByEmbedding(query) {
    await this.#connectToRedis();
    logger.info(`Generating embedding for query: "${query}"`);
    const [queryEmbedding] = await this.#generateEmbeddings([query]);

    const allBookEmbeddings = await redisClient.hGetAll('book_embeddings');
    if (!allBookEmbeddings || Object.keys(allBookEmbeddings).length === 0) {
      return [];
    }

    const similarityScores = [];
    for (const bookKey in allBookEmbeddings) {
      const bookId = bookKey.split(':')[1];
      const bookEmbedding = JSON.parse(allBookEmbeddings[bookKey]);
      const similarity = cosineSimilarity(queryEmbedding, bookEmbedding);

      // Set a threshold to only return reasonably relevant results
      if (similarity > 0.3) {
        similarityScores.push({ bookId, score: similarity });
      }
    }

    similarityScores.sort((a, b) => b.score - a.score);
    return similarityScores;
  }
}

module.exports = new EmbeddingService();
