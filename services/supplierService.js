const db = require('../db/firestore');

/**
 * Retrieves a unique list of all suppliers from the prices collection.
 * @returns {Promise<Array<string>>} A list of unique supplier names.
 */
async function getSuppliers() {
  try {
    const snapshot = await db.collection('prices').get();
    const uniqueSuppliers = [];
    snapshot.forEach(doc => {
      uniqueSuppliers.push({ id: doc.id, ...doc.data() });
    });
    return uniqueSuppliers;
    
  } catch (error) {
    console.error('Error retrieving suppliers:', error);
    throw error;
  }
}

module.exports = { getSuppliers };