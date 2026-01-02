const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { apiOk, apiError } = require('../utils/apiResponse');

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Users]
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
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 */
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const newUser = await authService.registerUser(username, password, role);
    apiOk(res, newUser, 'User registered successfully', 201);
  } catch (error) {
    apiError(res, error.message, 400);
  }
});

router.get('/roles', async (req,res) => {
  try{
    const roles = await authService.getRoles();
    apiOk(res, roles);
  }catch(error){
      apiError(res, 'Could not fetch roles', 500);
  }
});

router.get('/', async (req, res) => {
    try {
      const users = await authService.getAllUsers();
      apiOk(res, users);
    } catch (error) {
        apiError(res, 'Could not fetch user', 500);
    }
  });
/**
 * @swagger
 * /users/active/{active}:
 *   get:
 *     summary: Gets all users
 *     tags: [Users]
 *     parameters:
 */
router.get('/active/:active', async (req, res) => {
  try {
    const param =(req.params.active);
    if(param !== 'true' && param !== 'false')
    {
      apiError(res, 'Parameter active must be true or false', 400);
      return;
    }
    const users = await authService.getUserByActive(param);
    apiOk(res, users);
  } catch (error) {
      apiError(res, 'Could not fetch user', 500);
  }
});
/**
 * @swagger
 * /users/approve/{username}:
 *   put:
 *     summary: Approves a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to approve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User approved successfully
 *       404:
 *         description: User not found
 */
router.put('/approve/:username/:rolename', async (req, res) => {
  try {
    const username = req.params.username;
    const rolename = req.params.rolename;
    await authService.approvedUser(username,rolename);
    apiOk(res, { message: 'User approved successfully' });
  } catch (error) {
      apiError(res, 'Could not fetch user', 500);
  }
});

module.exports = router;
