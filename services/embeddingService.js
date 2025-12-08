const redisClient = require('../db/redis');
const logger = require('../utils/logger');

// In a real application, you would use a proper NLP model for this.
const generateEmbedding = (text) => {
  // For demonstration, we'll generate a random vector.
  // NOTE: With random vectors, the search results will also be random.
  // For meaningful results, a real text embedding model is needed.
  const embeddingSize = 128;
  const embedding = Array.from({ length: embeddingSize }, () => Math.random());
  return embedding;
};

// Calculates the cosine similarity between two vectors.
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }
  return dotProduct / (magnitudeA * magnitudeB);
};

class EmbeddingService {
  async createBookEmbeddings(books) {
    if (!books || books.length === 0) {
      logger.info('No books provided to create embeddings.');
      return;
    }

    const embeddingPromises = books.map(async (book) => {
      const embedding = generateEmbedding(book.title);
      return redisClient.hSet('book_embeddings', `book:${book.id}`, JSON.stringify(embedding));
    });

    await Promise.all(embeddingPromises);
    logger.info('Book embeddings created and stored in Redis.');
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

    // 5. Fetch the actual book data for the top results.
    // In this example, we'll just return the IDs and scores.
    // A full implementation would fetch book details from the main book cache or DB.
    logger.info(`Found ${similarityScores.length} books, returning top results.`);
    return similarityScores;
  }
}

module.exports = new EmbeddingService();