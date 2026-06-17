import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_URL;
const opts = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };

// --- API Calls ---

export const signupUser = createAsyncThunk('user/signupUser',
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/auth/register`, { name, email, password }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response.data); }
    }
);

export const signinUser = createAsyncThunk('user/signinUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/auth/signin`, { email, password }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response.data); }
    }
);

export const logoutUser = createAsyncThunk('user/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/auth/logout`, {}, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response.data); }
    }
);

export const checkAuth = createAsyncThunk('user/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE}/api/auth/is-auth`, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response.data); }
    }
);

export const forgotPassword = createAsyncThunk('user/forgotPassword',
    async ({ email }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/auth/send-reset-token`, { email }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response.data); }
    }
);

export const resetPassword = createAsyncThunk('user/resetPassword',
    async ({ token, newPassword }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/auth/reset-password`, { token, newPassword }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response.data); }
    }
);

export const verifyResetToken = createAsyncThunk('user/verifyResetToken',
    async ({ token }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE}/api/auth/verify-reset-token`, { token }, opts);
            return res.data;
        } catch (err) { return rejectWithValue(err.response.data); }
    }
);

// --- Data stored in Redux ---
const initialState = {
    username: '',
    email: '',
    avatar: '',
    isLoggedin: false,
    authLoading: true, // true while checking if user is logged in on page load
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setTempEmail: (state, action) => { state.tempemail = action.payload; },
    },
    extraReducers: builder => {
        builder
            // When signin succeeds → store user data
           .addCase(signinUser.fulfilled, (state, action) => {
    const user = action.payload?.user;
    if (user) {
        state.isLoggedin = true;
        state.username = user.name || '';
        state.email = user.email || '';
        state.avatar = user.avatar || '';
    }
})
            // When logout succeeds → clear user data
            .addCase(logoutUser.fulfilled, state => {
                state.isLoggedin = false;
                state.username = '';
                state.email = '';
                state.avatar = '';
            })
            // While checking auth → set loading true
            .addCase(checkAuth.pending, state => {
                state.authLoading = true;
            })
            // When auth check succeeds → store user data
            .addCase(checkAuth.fulfilled, (state, action) => {
        state.authLoading = false;
    const user = action.payload?.user;
    if (user) {
        state.isLoggedin = true;
        state.username = user.name || '';
        state.email = user.email || '';
        state.avatar = user.avatar || '';
    } else {
        state.isLoggedin = false;
    }
})
            // When auth check fails → user is not logged in
            .addCase(checkAuth.rejected, state => {
                state.authLoading = false;
                state.isLoggedin = false;
            });
    },
});

export const { setTempEmail } = userSlice.actions;
export const userReducer = userSlice.reducer;