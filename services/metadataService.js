
const db = require('../db/firestore');

const getVersion = async (documentName) => {
  const doc = await db.collection('metadata').doc(documentName).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data().version;
};

module.exports = {
  getVersion,
};
