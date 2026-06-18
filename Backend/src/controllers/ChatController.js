import ChatModel from '../models/ChatModel.js';
import { generateWithGroq } from '../utils/generate.js';
import { getTitlePrompt, getResponsePrompt } from '../utils/prompt.js';



export const createChat = async (req, res) => {
    try {
        const { roadmapId, moduleId, userMessage } = req.body;

        const raw = await generateWithGroq(getTitlePrompt(userMessage));
        let parsed;
        try {
            parsed = JSON.parse(raw.trim().replace(/^```json\s*|\s*```$/g, '').trim());
        } catch {
            return res.status(500).json({ success: false, message: 'Failed to parse AI response' });
        }

        const newChat = await ChatModel.create({
            email: req.email,
            roadmapId,
            moduleId,
            title: parsed.title,
            messages: [
                { role: 'user', content: userMessage,    time: Date.now() },
                { role: 'ai',   content: parsed.response, time: Date.now() },
            ],
        });

        return res.status(201).json({ success: true, data: parsed, chatId: newChat._id });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getResponse = async (req, res) => {
    try {
        const { chatId, userMessage } = req.body;
        const chat = await ChatModel.findById(chatId);
        if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

        const context = chat.messages.slice(-8).map(m => `${m.role}: ${m.content}`).join('\n');
        const response = await generateWithGroq(getResponsePrompt(userMessage, context));

        chat.messages.push({ role: 'user', content: userMessage, time: Date.now() });
        chat.messages.push({ role: 'ai',   content: response,    time: Date.now() });
        await chat.save();

        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


//--- Operation on chats --------------------------------------


export const getChats = async (req, res) => {
    try {
        const { roadmapId, moduleId } = req.body;
        const chats = await ChatModel.find({ email: req.email, roadmapId, moduleId });
        return res.status(200).json({ success: true, data: chats });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getChat = async (req, res) => {
    try {
        const chat = await ChatModel.findById(req.body.chatId);
        if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
        return res.status(200).json({ success: true, data: chat });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const chat = await ChatModel.findByIdAndDelete(req.body.chatId);
        if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
        return res.status(200).json({ success: true, message: 'Chat deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const renameChat = async (req, res) => {
    try {
        const { chatId, newTitle } = req.body;
        const chat = await ChatModel.findById(chatId);
        if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
        chat.title = newTitle;
        await chat.save();
        return res.status(200).json({ success: true, data: chat });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};