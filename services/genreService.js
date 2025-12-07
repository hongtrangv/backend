
const db = require('../db/firestore');

const getGenres = async () => {
  const snapshot = await db.collection('genres').get();
  const genres = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return genres;
};

module.exports = {
  getGenres,
};
