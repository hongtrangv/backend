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
  const { description, assignee, isView, date, complete, dueDate,createdBy} = taskData;
  const taskToAdd = { description, assignee, isView, date, complete,dueDate,createdBy };

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
    let query = tasksRef.where('date', '==', date);
      
    if (assignee)
      query = query.where('assignee', '==', assignee);

    const snapshot = await query.get();

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

/**
 * Gets all tasks for a specific assignee.
 * @param {string} assignee - The assignee of the tasks.
 * @returns {Promise<Array<object>>} A list of tasks.
 */
const getTasksByAssignee = async (assignee) => {
  logger.info(`Fetching all tasks for assignee: ${assignee}`);
  try {
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.where('assignee', '==', assignee).get();

    if (snapshot.empty) {
      logger.info('No matching documents for this assignee.');
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
/**
 * 
 * @param {*} createdBy 
 */
const getTaskCreateBy = async (createdBy) => {
  logger.info(`Fetching all tasks for assignee: ${createdBy}`);
  try {
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.where('createdBy', '==', createdBy).get();

    if (snapshot.empty) {
      logger.info('No matching documents for this createdBy.');
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
/**
 * Gets all uncompleted tasks.
 * @returns {Promise<Array<object>>} A list of uncompleted tasks.
 */
const getUncompletedTasks = async () => {
  logger.info(`Fetching all uncompleted tasks.`);
  try {
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.where('complete', '==', false).get();

    if (snapshot.empty) {
      logger.info('No uncompleted tasks found.');
      return [];
    }

    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (error) {
    logger.error('Error getting uncompleted tasks: ', error);
    throw new Error('Could not retrieve uncompleted tasks.');
  }
};

/**
 * Updates the completion status of a task.
 * @param {string} taskId - The ID of the task to update.
 * @param {boolean} isComplete - The new completion status.
 * @returns {Promise<object>} The updated task data.
 */
const updateTaskCompletion = async (taskId, isComplete) => {
  logger.info(`Updating task ${taskId} to completion status: ${isComplete}`);
  try {
    const taskRef = db.collection('tasks').doc(taskId);
    await taskRef.update({ complete: isComplete,completeDate: new Date() });
    
    const updatedDoc = await taskRef.get();
    if (!updatedDoc.exists) {
        throw new Error('Task not found after update.');
    }
    
    logger.info(`Task ${taskId} updated successfully.`);
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    logger.error(`Error updating task ${taskId}: `, error);
    throw new Error('Could not update task completion status.');
  }
};

module.exports = {
  createTaskQuery,
  getTasksByAssigneeAndDate,
  getTasksByAssignee,
  getUncompletedTasks,
  updateTaskCompletion,
  getTaskCreateBy,
};
