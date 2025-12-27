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

module.exports = router;
