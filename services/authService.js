const bcrypt = require('bcrypt');
const asyncLocalStorage = require('../utils/context');
const logger = require('../utils/logger');
const db = require('../db/firestore');

/**
 * Fetches menus and submenus for a given role from Firestore.
 * @param {string} role - The user's role.
 * @returns {Array} - An array of menu objects with nested submenus.
 */
async function getMenusForRole(role) {
    if (!role) return [];

    const snapshot = await db
    .collection("menu") // đổi thành tên collection của bạn
    .where("permissions", "array-contains", role)
    .get();

    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (results.length === 0) return [];        
    return results;
}

/**
 * Registers a new user.
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @param {string} role - The user's role.
 * @returns {object} - The newly created user.
 * @throws {Error} - If the user already exists.
 */
const registerUser = async (username, password, role, fullname) => {
  const userRef = db.collection('users').doc(username);
  const doc = await userRef.get();

  if (doc.exists) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await userRef.set({
    username,
    fullname,
    password: hashedPassword,
    role,
  });

  logger.info(`User '${username}' registered successfully.`);
  return { username, role };
};

/**
 * Fetches all roles from Firestore.
 * @returns {Array} - An array of role objects.
 */
const getRoles = async () => {
  const rolesRef = db.collection('roles');
  const snapshot = await rolesRef.get();

  if (snapshot.empty) {
    return [];
  }

  const roles = [];
  snapshot.forEach(doc => {
    roles.push({ id: doc.id, ...doc.data() });
  });

  return roles;
};


/**
 * Logs in a user.
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @returns {object} - An object containing user information and menus if successful.
 * @throws {Error} - If login fails.
 */
const login = async (username, password) => {
  try {
    const userRef = db.collection('users').doc(username);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      logger.warn(`Failed login attempt for user: ${username}. User not found.`);
      throw new Error('Invalid credentials');
    }

    const userData = userDoc.data();
    const isMatch = await bcrypt.compare(password, userData.password);

    if (isMatch) {
      logger.info(`User '${username}' logged in successfully.`);
      
      const role = userData.role;
      const menus = await getMenusForRole(role);
      logger.info(`Fetched menus for role: ${role}`);
      logger.info(`Menus: ${JSON.stringify(menus)}`);
      const userContext = {
        username: userData.username,
        fullname: userData.fullname,        
        role: role,
        menus: menus
      };
      return userContext;
    } else {
      logger.warn(`Failed login attempt for user: ${username}. Invalid password.`);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    logger.error('Error during login:', error);
    throw new Error('Authentication failed.');
  }
};

/**
 * Gets the current user context.
 * This is a placeholder for how we might retrieve context.
 * In a real app, this would come from a session or token middleware.
 */
const getUserContext = () => {
  const store = asyncLocalStorage.getStore();
  if (store && store.user) {
    return store.user;
  }
  return null; // No user context found
};

module.exports = {
  login,
  getUserContext,
  registerUser,
  getRoles,
};
