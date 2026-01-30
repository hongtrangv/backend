const db = require('../db/firestore');

/**
 * Retrieves all products from the database.
 * @returns {Promise<Array<object>>} A list of all products.
 */
async function getProducts() {
  try {
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return products;
  } catch (error) {
    console.error('Error retrieving products:', error);
    throw error;
  }
}

module.exports = { getProducts };