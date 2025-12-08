require('dotenv').config();
const redisClient = require('../db/redis');
const logger = require('../utils/logger');

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

  async createBookEmbeddings(books) {
    if (!books || books.length === 0) {
        logger.info('No books provided to create embeddings.');
        return;
    }

    logger.info(`Generating embeddings for ${books.length} books...`);

    // Process books in smaller batches to conserve memory
    const batchSize = 100;
    for (let i = 0; i < books.length; i += batchSize) {
        const batchBooks = books.slice(i, i + batchSize);
        logger.info(`Processing batch of ${batchBooks.length} books...`);

        const texts = batchBooks.map(book => {
            const parts = [];
            if (book.title) parts.push(`Title: ${book.title}`);
            if (book.genre) parts.push(`Genre: ${book.genre}`);
            if (book.description) parts.push(`Description: ${book.description}`);
            if (book.author) parts.push(`Author: ${book.author}`);
            return parts.join(', ');
        });

        const embeddings = await this.#generateEmbeddings(texts);
        
        const pipeline = redisClient.pipeline();
        batchBooks.forEach((book, index) => {
            if (embeddings[index]) {
                pipeline.hSet('book_embeddings', `book:${book.id}`, JSON.stringify(embeddings[index]));
            }
        });

        await pipeline.exec();
        logger.info(`Batch of ${batchBooks.length} books processed and embeddings stored.`);
    }

    logger.info('All book embeddings have been recreated.');
}


  async searchBooksByEmbedding(query) {
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
