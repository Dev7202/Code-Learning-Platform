import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_URL;
const opts = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };

// ─── API Calls ────────────────────────────────────────────────

export const generateRoadmap = createAsyncThunk('roadmap/generateRoadmap',
    async ({ userDescription, userLevel }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/roadmap/generate`, { userDescription, userLevel }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const fetchUserRoadmaps = createAsyncThunk('roadmap/fetchUserRoadmaps',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE}/api/roadmap/get-roadmaps`, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const deleteUserRoadmap = createAsyncThunk('roadmap/deleteUserRoadmap',
    async (roadmapId, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/roadmap/delete-roadmap`, { roadmapId }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const getUserRoadmapById = createAsyncThunk('roadmap/getUserRoadmapById',
    async (roadmapId, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/roadmap/get-roadmap-by-id`, { roadmapId }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const togglePinRoadmap = createAsyncThunk('roadmap/togglePinRoadmap',
    async (roadmapId, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/roadmap/toggle-pin`, { roadmapId }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const fetchNotes = createAsyncThunk('roadmap/fetchNotes',
    async (roadmapId, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE}/api/roadmap/notes/${roadmapId}`, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data); }
    }
);

export const saveNote = createAsyncThunk('roadmap/saveNote',
    async ({ roadmapId, subtopicId, moduleId, content }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/roadmap/notes/save`,
                { roadmapId, subtopicId, moduleId, content }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data); }
    }
);

export const saveProgress = createAsyncThunk('roadmap/saveProgress',
    async ({ roadmapId, chapterId, subtopicId }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/roadmap/save-progress`,
                { roadmapId, chapterId, subtopicId }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data); }
    }
);

export const generateSubtopicSummary = createAsyncThunk('roadmap/generateSubtopicSummary',
    async ({ roadmapId, moduleId, subtopicId, personalization }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/roadmap/generate-subtopic-summary`,
                { roadmapId, chapterId: moduleId, subtopicId, personalization }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const fetchSubtopicExplanation = createAsyncThunk('roadmap/fetchSubtopicExplanation',
    async ({ roadmapId }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/roadmap/fetch-subtopic-summary`, { roadmapId }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data || { message: 'Unknown error' }); }
    }
);

export const generateQuiz = createAsyncThunk('roadmap/generateQuiz',
    async ({ roadmapId, moduleId, subtopicId }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/roadmap/generate-quiz`,
                { roadmapId, chapterId: moduleId, subtopicId }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data); }
    }
);

export const getQuizzes = createAsyncThunk('roadmap/getQuizzes',
    async ({ roadmapId, chapterId, subtopicId }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/roadmap/get-quizzes`,
                { roadmapId, chapterId, subtopicId }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response?.data); }
    }
);

// ─── Initial State ────────────────────────────────────────────

const initialState = {
    currRoadmap: {},
    generation_loading: false,
    generation_error: false,
    fetch_loading: true,
    userRoadmaps: [],
    notes: {},
    notes_loading: false,
    explanation_loading: [],
    quizData: {},
    quizLoading: [],
};

// ─── Slice ────────────────────────────────────────────────────

export const roadmapSlice = createSlice({
    name: 'roadmap',
    initialState,
    reducers: {
        setcurrRoadmap: (state, action) => {
            state.currRoadmap = action.payload;
        },
        resetRoadmap: state => {
            state.currRoadmap = {};
            state.generation_loading = false;
            state.generation_error = false;
        },
        updateNoteInState: (state, action) => {
            const { subtopicId, moduleId, content } = action.payload;
            state.notes[`${moduleId}:${subtopicId}`] = content;
        },
    },
    extraReducers: builder => {
        builder
            // Generate Roadmap
            .addCase(generateRoadmap.pending, state => {
                state.generation_loading = true;
                state.generation_error = false;
            })
            .addCase(generateRoadmap.fulfilled, (state, action) => {
                state.generation_loading = false;
                state.userRoadmaps.push(action.payload.data);
            })
            .addCase(generateRoadmap.rejected, state => {
                state.generation_loading = false;
                state.generation_error = true;
            })

            // Fetch All Roadmaps
            .addCase(fetchUserRoadmaps.pending, state => {
                state.fetch_loading = true;
            })
            .addCase(fetchUserRoadmaps.fulfilled, (state, action) => {
                state.fetch_loading = false;
                state.userRoadmaps = action.payload.data || [];
            })
            .addCase(fetchUserRoadmaps.rejected, state => {
                state.fetch_loading = false;
            })

            // Delete Roadmap
            .addCase(deleteUserRoadmap.fulfilled, (state, action) => {
                const id = action.meta.arg;
                state.userRoadmaps = state.userRoadmaps.filter(r => r._id !== id);
            })

            // Toggle Pin
            .addCase(togglePinRoadmap.fulfilled, (state, action) => {
                const updated = action.payload.data;
                const idx = state.userRoadmaps.findIndex(r => r._id === updated._id);
                if (idx !== -1) {
                    state.userRoadmaps[idx] = updated;
                    state.userRoadmaps.sort((a, b) =>
                        b.isPinned - a.isPinned ||
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                }
            })

            // Fetch Notes
            .addCase(fetchNotes.pending, state => {
                state.notes_loading = true;
                state.notes = {};
            })
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.notes_loading = false;
                state.notes = action.payload.data;
            })
            .addCase(fetchNotes.rejected, state => {
                state.notes_loading = false;
            })
            .addCase(saveNote.fulfilled, (state, action) => {
                const note = action.payload.data;
                const key = `${note.moduleId}:${note.subtopicId}`;
                state.notes[key] = note.content; 
            })

            // Generate Subtopic Summary
            .addCase(generateSubtopicSummary.pending, (state, action) => {
                const { moduleId, subtopicId } = action.meta.arg;
                state.explanation_loading.push(`${moduleId}:${subtopicId}`);
            })
            .addCase(generateSubtopicSummary.fulfilled, (state, action) => {
                const { moduleId, subtopicId } = action.meta.arg;
                state.explanation_loading = state.explanation_loading
                    .filter(id => id !== `${moduleId}:${subtopicId}`);
            })
            .addCase(generateSubtopicSummary.rejected, (state, action) => {
                const { moduleId, subtopicId } = action.meta.arg;
                state.explanation_loading = state.explanation_loading
                    .filter(id => id !== `${moduleId}:${subtopicId}`);
            })

            // Generate Quiz
            .addCase(generateQuiz.pending, (state, action) => {
                const { moduleId, subtopicId } = action.meta.arg;
                state.quizLoading.push(`${moduleId}:${subtopicId}`);
            })
            .addCase(generateQuiz.fulfilled, (state, action) => {
                const { moduleId, subtopicId } = action.meta.arg;
                const key = `${moduleId}:${subtopicId}`;
                state.quizLoading = state.quizLoading.filter(k => k !== key);
                state.quizData[key] = action.payload.data;
            })
            .addCase(generateQuiz.rejected, (state, action) => {
                const { moduleId, subtopicId } = action.meta.arg;
                state.quizLoading = state.quizLoading
                    .filter(k => k !== `${moduleId}:${subtopicId}`);
            })
            .addCase(getQuizzes.fulfilled, (state, action) => {
                const { chapterId, subtopicId } = action.meta.arg;
                const key = `${chapterId}:${subtopicId}`;
                const quizzes = action.payload.data;
                if (quizzes && quizzes.length > 0) {
                state.quizData[key] = quizzes[0].quiz;
                }
            })
            .addCase(saveProgress.fulfilled, (state, action) => {
            const updated = action.payload.data;
            const idx = state.userRoadmaps.findIndex(r => r._id === updated._id);
            if (idx !== -1) state.userRoadmaps[idx] = updated;
            })
            
    },
});

export const { setcurrRoadmap, resetRoadmap, updateNoteInState } = roadmapSlice.actions;
export const roadmapReducer = roadmapSlice.reducer;