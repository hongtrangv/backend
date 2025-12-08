const redisClient = require('../db/redis');
const logger = require('../utils/logger');

const EMBEDDING_SIZE = 128;

// A simple and fast string hashing function (cyrb53) to generate a numeric hash.
const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// Creates a more advanced, deterministic embedding from text using words and n-grams.
const generateEmbedding = (text) => {
  const embedding = new Array(EMBEDDING_SIZE).fill(0);
  if (!text) {
    return embedding;
  }

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).filter(w => w.length > 0);

  // Process each word
  words.forEach(word => {
    // 1. Hash the whole word to give it a unique signature
    const wordHash = cyrb53(word);
    embedding[wordHash % EMBEDDING_SIZE] += 1.5; // Give more weight to whole words

    // 2. Hash character n-grams (e.g., trigrams) to capture sub-word similarities
    // This helps with typos or variations like 'programming' vs 'program'
    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        const trigram = word.substring(i, i + 3);
        const trigramHash = cyrb53(trigram);
        embedding[trigramHash % EMBEDDING_SIZE] += 0.5; // Lesser weight for n-grams
      }
    }
  });

  // Normalize the vector (L2 normalization) to have a unit length.
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    return embedding;
  }
  return embedding.map(val => val / magnitude);
};


// Calculates the cosine similarity between two vectors.
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  return dotProduct;
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
    logger.info('Book embeddings have been recreated using the new advanced logic.');
  }

  async searchBooksByEmbedding(query) {
    logger.info(`Searching for books with query: "${query}"`);
    const queryEmbedding = generateEmbedding(query);
    const allBookEmbeddings = await redisClient.hGetAll('book_embeddings');

    if (!allBookEmbeddings || Object.keys(allBookEmbeddings).length === 0) {
      return [];
    }

    const similarityScores = [];
    for (const bookKey in allBookEmbeddings) {
      const bookId = bookKey.split(':')[1];
      const bookEmbedding = JSON.parse(allBookEmbeddings[bookKey]);
      const similarity = cosineSimilarity(queryEmbedding, bookEmbedding);
      if (similarity > 0) { // Only consider results with some similarity
          similarityScores.push({ bookId, score: similarity });
      }
    }

    similarityScores.sort((a, b) => b.score - a.score);
    return similarityScores;
  }
}

module.exports = new EmbeddingService();