require('dotenv').config();
const OpenAI = require('openai');
const redisClient = require('../db/redis');
const logger = require('../utils/logger');

const API_KEY = process.env.OPENAI_API_KEY;

// Check for the API key at startup and log a warning if it's missing.
if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
  logger.warn('OPENAI_API_KEY is not set in the .env file. Embedding service will not work.');
}

// Initialize OpenAI client only if the key is provided.
const openai = API_KEY && API_KEY !== 'YOUR_API_KEY_HERE' ? new OpenAI({ apiKey: API_KEY }) : null;
const EMBEDDING_MODEL = 'text-embedding-3-small';

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
  // Generates embeddings for a batch of texts using the OpenAI API.
  async #generateEmbeddings(texts) {
    if (!openai) {
      logger.error('OpenAI client is not initialized. Cannot generate embeddings.');
      throw new Error('OpenAI API key not configured.');
    }
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts.map(t => t.replace(/\n/g, ' ')), // Sanitize input
      });
      return response.data.map(d => d.embedding);
    } catch (error) {
      logger.error(`Failed to generate embeddings from OpenAI: ${error.message}`);
      throw error;
    }
  }

  async createBookEmbeddings(books) {
    if (!openai) return; // Do nothing if the service isn't configured
    if (!books || books.length === 0) {
      logger.info('No books provided to create embeddings.');
      return;
    }

    logger.info(`Generating OpenAI embeddings for ${books.length} books...`);

    // Batch titles, genres, and descriptions to send to OpenAI
    const texts = books.map(book => {
        const parts = [];
        if (book.title) {
            parts.push(`Title: ${book.title}`);
        }
        if (book.genre) {
            parts.push(`Genre: ${book.genre}`);
        }
        if (book.description) {
            parts.push(`Description: ${book.description}`);
        }
        if (book.author) {
          parts.push(`Author: ${book.author}`);
        }
        return parts.join(', ');
    });
    const embeddings = await this.#generateEmbeddings(texts);

    const pipeline = redisClient.pipeline();
    books.forEach((book, index) => {
      if (embeddings[index]) {
        pipeline.hSet('book_embeddings', `book:${book.id}`, JSON.stringify(embeddings[index]));
      }
    });

    await pipeline.exec();
    logger.info('Book embeddings have been recreated using OpenAI.');
  }

  async searchBooksByEmbedding(query) {
    if (!openai) {
        logger.warn('Search via embedding is skipped: OpenAI key is not configured.');
        return [];
    }
    
    logger.info(`Generating OpenAI embedding for query: "${query}"`);
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
