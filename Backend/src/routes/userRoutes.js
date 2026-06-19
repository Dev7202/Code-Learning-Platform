import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/UserController.js';
import userAuth from '../middlewares/userAuth.js';

const router = express.Router();

router.get('/profile',          userAuth, getProfile);
router.put('/profile',          userAuth, updateProfile);
router.post('/change-password', userAuth, changePassword);

export default router;