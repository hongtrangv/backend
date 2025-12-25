const db = require('../db/firestore');
const logger = require('../utils/logger');

/**
 * Creates a task query in the database.
 * @param {object} taskData - The data for the task.
 *   - {string} description - The task description.
 *   - {string} assignee - The person assigned to the task.
 *   - {boolean} isView - Whether the task has been viewed.
 *   - {Date} date - The date of the task.
 *   - {boolean} complete - Whether the task is complete.
 * @returns {Promise<object>} The created task data including its new ID.
 */
const createTaskQuery = async (taskData) => {
  logger.info('Creating task with data:', taskData);

  // Extract relevant fields from taskData to ensure no extra data is saved
  const { description, assignee, isView, date, complete } = taskData;
  const taskToAdd = { description, assignee, isView, date, complete };

  try {
    const docRef = await db.collection('tasks').add(taskToAdd);
    logger.info('Task document written with ID: ', docRef.id);
    return { id: docRef.id, ...taskToAdd };
  } catch (error) {
    logger.error('Error adding document to Firestore: ', error);
    throw new Error('Could not create task.');
  }
};

/**
 * Gets tasks by assignee and date.
 * @param {string} assignee - The assignee of the task.
 * @param {string} date - The date of the task in ISO format (e.g., '2024-05-23').
 * @returns {Promise<Array<object>>} A list of tasks.
 */
const getTasksByAssigneeAndDate = async (assignee, date) => {
  logger.info(`Fetching tasks for assignee: ${assignee} on date: ${date}`);
  try {
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef
      .where('assignee', '==', assignee)
      .where('date', '==', date)
      .get();

    if (snapshot.empty) {
      logger.info('No matching documents.');
      return [];
    }

    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (error) {
    logger.error('Error getting documents: ', error);
    throw new Error('Could not retrieve tasks.');
  }
};

module.exports = {
  createTaskQuery,
  getTasksByAssigneeAndDate,
};
