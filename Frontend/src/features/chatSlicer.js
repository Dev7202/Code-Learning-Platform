import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_URL;
const opts = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };

// ─── API Calls ────────────────────────────────────────────────

export const createChat = createAsyncThunk('chat/createChat',
    async ({ roadmapId, moduleId, userMessage }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/chat/create`,
                { roadmapId, moduleId, userMessage }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const getChatResponse = createAsyncThunk('chat/getChatResponse',
    async ({ chatId, userMessage }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/chat/respond`,
                { chatId, userMessage }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const fetchChatsForChapter = createAsyncThunk('chat/fetchChatsForChapter',
    async ({ roadmapId, moduleId }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/chat/get-chats`,
                { roadmapId, moduleId }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const fetchChat = createAsyncThunk('chat/fetchChat',
    async ({ chatId }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/chat/get-chat`, { chatId }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const deleteChat = createAsyncThunk('chat/deleteChat',
    async ({ chatId }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/chat/delete`, { chatId }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const renameChat = createAsyncThunk('chat/renameChat',
    async ({ chatId, newTitle }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/chat/rename`,
                { chatId, newTitle }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

// ─── Initial State ────────────────────────────────────────────

const initialState = {
    chats: {},
    // chats structure:
    // {
    //   "chapterId": {
    //     chats: [...],
    //     activeChatId: "abc123"
    //   }
    // }
};

// ─── Slice ────────────────────────────────────────────────────

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setActiveChat: (state, action) => {
            const { moduleId, chatId } = action.payload;
            if (!state.chats[moduleId]) {
                state.chats[moduleId] = { chats: [], activeChatId: null };
            }
            state.chats[moduleId].activeChatId = chatId || null;
        },
    },
    extraReducers: builder => {
        builder
            // Fetch all chats for a chapter
            .addCase(fetchChatsForChapter.fulfilled, (state, action) => {
                const { moduleId } = action.meta.arg;
                if (!state.chats[moduleId]) {
                    state.chats[moduleId] = { chats: [], activeChatId: null };
                }
                const prev = state.chats[moduleId].activeChatId;
                const backendChats = (action.payload.data || [])
                    .map(c => ({
                        id: c._id,
                        chatId: c._id,
                        title: c.title,
                        messages: c.messages || [],
                        createdAt: c.createdAt,
                    }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                state.chats[moduleId].chats = backendChats;
                state.chats[moduleId].activeChatId = prev === null
                    ? backendChats[0]?.id || null
                    : backendChats.find(c => c.id === prev)?.id || backendChats[0]?.id || null;
            })

            // Delete chat
            .addCase(deleteChat.fulfilled, (state, action) => {
                const { chatId } = action.meta.arg;
                const key = Object.keys(state.chats).find(k =>
                    state.chats[k].chats.some(c => c.chatId === chatId)
                );
                if (key) {
                    state.chats[key].chats = state.chats[key].chats.filter(c => c.chatId !== chatId);
                    if (state.chats[key].activeChatId === chatId) {
                        state.chats[key].activeChatId = state.chats[key].chats[0]?.id || null;
                    }
                }
            })

            // Rename chat
            .addCase(renameChat.fulfilled, (state, action) => {
                const { chatId, newTitle } = action.meta.arg;
                const chat = Object.values(state.chats)
                    .flatMap(c => c.chats)
                    .find(c => c.chatId === chatId);
                if (chat) chat.title = newTitle;
            });
    },
});

export const { setActiveChat } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;