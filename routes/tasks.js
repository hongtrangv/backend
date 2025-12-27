const express = require('express');
const router = express.Router();
const taskService = require('../services/taskService');
const { apiOk, apiError } = require('../utils/apiResponse');

/**
 * Route to create a new task query.
 */
router.post('/', async (req, res) => {
  try {
    const result = await taskService.createTaskQuery(req.body);
    apiOk(res, result);
  } catch (error) {
    apiError(res, error.message, 500);
  }
});

/**
 * Route to get tasks by assignee and date.
 */
router.get('/', async (req, res) => {
  try {
    const { assignee, date } = req.query;
    if (!assignee || !date) {
      return apiError(res, 'Assignee and date are required', 400);
    }
    const tasks = await taskService.getTasksByAssigneeAndDate(assignee, date);
    apiOk(res, tasks);
  } catch (error) {
    apiError(res, error.message, 500);
  }
});

/**
 * Route to get all tasks for a specific assignee.
 */
router.get('/assignee/:assignee', async (req, res) => {
    try {
        const { assignee } = req.params;
        const tasks = await taskService.getTasksByAssignee(assignee);
        apiOk(res, tasks);
    } catch (error) {
        apiError(res, error.message, 500);
    }
});

/**
 * Route to get all uncompleted tasks.
 */
router.get('/uncompleted', async (req, res) => {
    try {
        const tasks = await taskService.getUncompletedTasks();
        apiOk(res, tasks);
    } catch (error) {
        apiError(res, error.message, 500);
    }
});

/**
 * Route to update a task's completion status.
 */
router.put('/:taskId/complete', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { isComplete } = req.body;

        if (typeof isComplete !== 'boolean') {
            return apiError(res, 'isComplete must be a boolean.', 400);
        }

        const updatedTask = await taskService.updateTaskCompletion(taskId, isComplete);
        apiOk(res, updatedTask, 'Task completion status updated successfully.');
    } catch (error) {
        apiError(res, error.message, 500);
    }
});

module.exports = router;
