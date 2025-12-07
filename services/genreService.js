
const db = require('../db/firestore');

const getGenres = async () => {
  const snapshot = await db.collection('genre').get();
  const genres = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return genres;
};

const getGenreById = async (id) => {
  const doc = await db.collection('genre').doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

const createGenre = async (genreData) => {
    const docRef = await db.collection('genre').add(genreData);
    return { id: docRef.id, ...genreData };
};

const updateGenre = async (id, genreData) => {
    await db.collection('genre').doc(id).update(genreData);
    return { id: id, ...genreData };
};

const deleteGenre = async (id) => {
    await db.collection('genre').doc(id).delete();
};


module.exports = {
  getGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
};
