
const db = require('../db/firestore');

const getVersion = async (documentName) => {
  const doc = await db.collection('metadata').doc(documentName).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data().version;
};

const updateVersion = async (documentName) => {
    const currentVersion = await getVersion(documentName);
    const newVersion = (currentVersion || 0) + 1;
    await db.collection('metadata').doc(documentName).set({ version: newVersion }, { merge: true });
};

module.exports = {
  getVersion,
  updateVersion,
};
