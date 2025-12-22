const db = require('../db/firestore');
const logger = require('../utils/logger');

const getSpending = async (year, month, type) => {
  try {
    // Year and month are required to locate the collection of spendings.
    if (!year || !month) {
      throw new Error('Year and month parameters are required.');
    }

    let query = db.collection('Year').doc(String(year)).collection('Months').doc(String(month)).collection('Types');

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.get();
    const spendings = [];
    snapshot.forEach(doc => {
      spendings.push({ id: doc.id, ...doc.data() });
    });

    logger.info(`Successfully fetched ${spendings.length} spending items.`);
    return spendings;

  } catch (error) {
    logger.error(`Error in getSpending service: ${error.message}`);
    // Rethrow the error to be caught by the route handler
    throw error;
  }
};

module.exports = {
    getSpending,
};