const db = require('../db/firestore');

/**
 * Inserts a new price record into the database.
 * If the product does not exist in the 'products' collection, it will be created.
 * @param {object} priceData - The data for the new price.
 * @param {string} priceData.productName - The name of the product.
 * @param {number} priceData.price - The price of the product.
 * @param {Date} priceData.promotionDate - The date of the promotion.
 * @param {string} priceData.quotingUnit - The quoting unit.
 * @param {string} priceData.supplier - The name of the supplier.
 * @returns {Promise<object>} The newly created price record.
 */
async function insertPrice(priceData) {
  try {
    const { productName } = priceData;
    const productsRef = db.collection('products');
    const productQuery = await productsRef.where('name', '==', productName).get();

    if (productQuery.empty) {
      await productsRef.add({ name: productName });
    }

    const newPriceRef = await db.collection('prices').add(priceData);
    return { id: newPriceRef.id, ...priceData };
  } catch (error) {
    console.error('Error inserting price:', error);
    throw error;
  }
}

/**
 * Retrieves all price records from the database.
 * @returns {Promise<Array<object>>} A list of all price records.
 */
async function getPrices() {
  try {
    const snapshot = await db.collection('prices').get();
    const prices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return prices;
  } catch (error) {
    console.error('Error retrieving prices:', error);
    throw error;
  }
}

/**
 * Retrieves and sorts the prices for a specific product.
 * @param {string} productName - The name of the product.
 * @param {string} [orderBy='price'] - The field to sort by.
 * @param {string} [order='asc'] - The sort order ('asc' or 'desc').
 * @returns {Promise<Array<object>>} A sorted list of price records for the product.
 */
async function getProductPrices(productName, orderBy = 'price', order = 'asc') {
  try {
    let query = db.collection('prices').where('productName', '==', productName);

    if (orderBy) {
      query = query.orderBy(orderBy, order);
    }

    const snapshot = await query.get();
    const prices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return prices;
  } catch (error) {
    console.error('Error retrieving product prices:', error);
    throw error;
  }
}

module.exports = {
  insertPrice,
  getPrices,
  getProductPrices,
};