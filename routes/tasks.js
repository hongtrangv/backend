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
    apiError(res, error, 500);
  }
});

/**
 * Route to get tasks by assignee and date.
 */
router.get('/', async (req, res) => {
  try {
    const { assignee, date } = req.query;
    if (!assignee || !date) {
      return apiError(res, { message: 'Assignee and date are required' }, 400);
    }
    const tasks = await taskService.getTasksByAssigneeAndDate(assignee, date);
    apiOk(res, tasks);
  } catch (error) {
    apiError(res, error, 500);
  }
});

module.exports = router;
