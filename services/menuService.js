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
    .select('name','icon','path')
    .orderBy("position","asc")
    .get();

    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (results.length === 0) return [];        
    return results;
}

/**
 * Adds a new menu to Firestore.
 * @param {string} name - The name of the menu.
 * @param {string} icon - The icon of the menu.
 * @param {string} path - The path of the menu.
 * @param {Array<string>} permissions - An array of roles that can access this menu.
 * @returns {object} - The newly created menu.
 */
async function addMenu(name, icon, path, permissions) {
  const menuRef = db.collection("menu").doc();
  const newMenu = {
    name,
    icon,
    path,
    permissions,
  };
  await menuRef.set(newMenu);
  logger.info(`Menu '${name}' added successfully.`);
  return { id: menuRef.id, ...newMenu };
}

/**
 * Updates an existing menu in Firestore.
 * @param {string} id - The ID of the menu to update.
 * @param {object} menuData - The data to update.
 * @returns {object} - The updated menu.
 */
async function updateMenu(id, menuData) {
  const menuRef = db.collection("menu").doc(id);
  await menuRef.update(menuData);
  logger.info(`Menu with ID '${id}' updated successfully.`);
  return { id, ...menuData };
}

module.exports = {
  getMenusForRole,
  addMenu,
  updateMenu,
};
