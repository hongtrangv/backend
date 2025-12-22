const db = require('../db/firestore');
const logger = require('../utils/logger');

const getSpending = async (year, month, type) => {
  try {
    // Year, month, and type are all required to locate the document.
    if (!year || !month || !type) {
      throw new Error('Year, month, and type parameters are required.');
    }

    // The 'type' must be either 'Thu' (income) or 'Chi' (expense).
    if (type !== 'Thu' && type !== 'Chi') {
        logger.warn(`Invalid type specified: ${type}. Must be 'Thu' or 'Chi'.`);
        return []; // Return empty if the type is invalid.
    }

    // Construct the reference to the specific document ('Thu' or 'Chi').
    const docRef = db.collection('Year').doc(String(year))
                     .collection('Months').doc(String(month))
                     .collection('Types').doc(type);

    const doc = await docRef.get();

    if (!doc.exists) {
      logger.info(`Document not found for type '${type}' in ${month}/${year}.`);
      return []; // Return an empty array if the document doesn't exist.
    }

    // Assuming the array of records is stored in a field named 'records'.
    const data = doc.data();
    const spendings = data.records || [];

    if (!Array.isArray(spendings)) {
        logger.error(`The 'records' field for type '${type}' in ${month}/${year} is not an array.`);
        return [];
    }

    // Sort spendings by date in descending order (newest first).
    // This robustly handles date strings, JS Date objects, and Firestore Timestamps.
    spendings.sort((a, b) => {
        // Push records without a date to the end.
        if (!b.date) return -1;
        if (!a.date) return 1;

        // Create Date objects for robust comparison.
        // This handles Firestore Timestamps (which have a .toDate() method) and standard date strings.
        const dateA = new Date(a.date.toDate ? a.date.toDate() : a.date);
        const dateB = new Date(b.date.toDate ? b.date.toDate() : b.date);
        
        // Sort descending (newest first). Invalid dates are handled gracefully.
        return dateB - dateA;
    });

    logger.info(`Successfully fetched and sorted ${spendings.length} items from document '${type}' for ${month}/${year}.`);
    return spendings;

  } catch (error) {
    logger.error(`Error in getSpending service: ${error.message}`);
    // Rethrow the error to be handled by the API route.
    throw error;
  }
};

module.exports = {
    getSpending,
};
