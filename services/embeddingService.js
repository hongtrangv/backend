const redisClient = require('../db/redis');
const logger = require('../utils/logger');

const EMBEDDING_SIZE = 128;

// Creates a deterministic, but simple, embedding from text.
const generateEmbedding = (text) => {
  const embedding = new Array(EMBEDDING_SIZE).fill(0);
  if (!text) {
    return embedding;
  }

  const lowerText = text.toLowerCase();

  for (let i = 0; i < lowerText.length; i++) {
    const charCode = lowerText.charCodeAt(i);
    // Simple hashing: distribute character codes across the embedding vector
    embedding[charCode % EMBEDDING_SIZE] += 1;
  }

  // Normalize the vector (L2 normalization) to have a unit length.
  // This is crucial for cosine similarity to work correctly.
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    return embedding; // Avoid division by zero
  }

  return embedding.map(val => val / magnitude);
};

// Calculates the cosine similarity between two vectors.
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  // Since vectors are normalized, their magnitudes are 1, so we can skip dividing by them.
  return dotProduct;
};

class EmbeddingService {
  async createBookEmbeddings(books) {
    if (!books || books.length === 0) {
      logger.info('No books provided to create embeddings.');
      return;
    }

    const embeddingPromises = books.map(async (book) => {
      // Now using the deterministic embedding function
      const embedding = generateEmbedding(book.title);
      return redisClient.hSet('book_embeddings', `book:${book.id}`, JSON.stringify(embedding));
    });

    await Promise.all(embeddingPromises);
    logger.info('Book embeddings created and stored in Redis using deterministic logic.');
  }

  async searchBooksByEmbedding(query) {
    logger.info(`Searching for books with query: "${query}"`);

    // 1. Generate an embedding for the search query.
    const queryEmbedding = generateEmbedding(query);

    // 2. Get all book embeddings from Redis.
    const allBookEmbeddings = await redisClient.hGetAll('book_embeddings');

    if (!allBookEmbeddings || Object.keys(allBookEmbeddings).length === 0) {
      logger.info('No book embeddings found in Redis.');
      return [];
    }

    // 3. Calculate similarity for each book.
    const similarityScores = [];
    for (const bookKey in allBookEmbeddings) {
      const bookId = bookKey.split(':')[1];
      const bookEmbedding = JSON.parse(allBookEmbeddings[bookKey]);
      const similarity = cosineSimilarity(queryEmbedding, bookEmbedding);
      similarityScores.push({ bookId, score: similarity });
    }

    // 4. Sort by similarity score in descending order.
    similarityScores.sort((a, b) => b.score - a.score);

    logger.info(`Found ${similarityScores.length} books, returning top results.`);
    return similarityScores;
  }
}

module.exports = new EmbeddingService();