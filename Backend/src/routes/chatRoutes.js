import express from 'express';
import { 
    createChat, getResponse, 
    getChats, getChat, deleteChat, renameChat 
} from '../controllers/ChatController.js';
import userAuth from '../middlewares/userAuth.js';

const router = express.Router();

router.post('/create',    userAuth, createChat);
router.post('/respond',   userAuth, getResponse);

router.post('/get-chats', userAuth, getChats);
router.post('/get-chat',  userAuth, getChat);
router.post('/delete',    userAuth, deleteChat);
router.post('/rename',    userAuth, renameChat);

export default router;