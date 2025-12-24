const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { apiOk, apiError } = require('../utils/apiResponse');
const asyncLocalStorage = require('../utils/context');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userContext = await authService.login(username, password);
    // In a real application, you'd establish a session here
    // For this example, we'll just send back the user context
    // and also set it in our async local storage for the duration of this request
    asyncLocalStorage.run({ user: userContext }, () => {
      apiOk(res, userContext, 'Login successful');
    });
  } catch (error) {
    apiError(res, error.message, 401);
  }
});

/**
 * @swagger
 * /auth/roles:
 *   get:
 *     summary: Gets all roles
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: A list of roles
 */
router.get('/roles', async (req, res) => {
  try {
    const roles = await authService.getRoles();
    apiOk(res, roles);
  } catch (error) {
    apiError(res, 'Could not fetch roles', 500);
  }
});

/**
 * @swagger
 * /auth/context:
 *   get:
 *     summary: Gets the current user context
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: The current user context
 *       404:
 *         description: No user context found
 */
router.get('/context', (req, res) => {
  const userContext = authService.getUserContext();
  if (userContext) {
    apiOk(res, userContext);
  } else {
    apiError(res, 'No user context found', 404);
  }
});

module.exports = router;
