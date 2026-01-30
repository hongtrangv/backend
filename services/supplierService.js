const db = require('../db/firestore');

/**
 * Retrieves a unique list of all suppliers from the prices collection.
 * @returns {Promise<Array<string>>} A list of unique supplier names.
 */
async function getSuppliers() {
  try {
    const snapshot = await db.collection('prices').get();
    const suppliers = snapshot.docs.map(doc => doc.data().supplier);
    const uniqueSuppliers = [...new Set(suppliers)];
    return uniqueSuppliers;
  } catch (error) {
    console.error('Error retrieving suppliers:', error);
    throw error;
  }
}

module.exports = { getSuppliers };