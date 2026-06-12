import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { transporter } from '../config/mailer.js';
import { passwordResetEmail } from '../utils/emailTemplates.js';
import { buildResetPasswordUrl } from '../utils/urlHelpers.js';

// Helper — set JWT cookie
const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

// ─── Register ────────────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.validatedData;

        const existing = await UserModel.findOne({ email });
        if (existing)
            return res.status(409).json({ success: false, message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ name, email, password: hashedPassword });

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        setTokenCookie(res, token);

        return res.status(201).json({
            success: true,
            message: 'Registered successfully',
            user: { name: user.name, email: user.email },
        });
    } catch (error) {
        console.log('REGISTER ERROR:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ─── Sign In ─────────────────────────────────────────────────
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.validatedData;

        const user = await UserModel.findOne({ email });
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ success: false, message: 'Incorrect password' });

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        setTokenCookie(res, token);

        return res.status(200).json({
            success: true,
            message: 'Signin successful',
            user: { name: user.name, email: user.email, avatar: user.avatar },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ─── Logout ──────────────────────────────────────────────────
export const logout = (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'None' });
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ─── Is Authenticated ─────────────────────────────────────────
export const isAuthenticated = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
            .select('-password -resetToken -resetTokenExpireAt');
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });

        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ─── Forgot Password — Send Reset Email ───────────────────────
export const sendResetToken = async (req, res) => {
    try {
        const { email } = req.validatedData;

        const user = await UserModel.findOne({ email });
        if (!user)
            return res.status(404).json({ success: false, message: 'No account found with this email' });

        const resetToken = crypto.randomUUID();
        user.resetToken = resetToken;
        user.resetTokenExpireAt = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        const resetUrl = buildResetPasswordUrl(resetToken);
        const { subject, html } = passwordResetEmail(resetUrl);

        await transporter.sendMail({
            from: process.env.SENDGRID_SENDER_EMAIL,
            to: email,
            subject,
            html,
        });

        return res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.log('SEND RESET TOKEN ERROR:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ─── Verify Reset Token ───────────────────────────────────────
export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.validatedData;

        const user = await UserModel.findOne({ resetToken: token });
        if (!user)
            return res.status(400).json({ success: false, message: 'Invalid or expired link' });
        if (user.resetTokenExpireAt < Date.now())
            return res.status(400).json({ success: false, message: 'Link has expired. Please request a new one.' });

        return res.status(200).json({ success: true, message: 'Token is valid' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ─── Reset Password ───────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.validatedData;

        const user = await UserModel.findOne({ resetToken: token });
        if (!user)
            return res.status(400).json({ success: false, message: 'Invalid or expired link' });
        if (user.resetTokenExpireAt < Date.now())
            return res.status(400).json({ success: false, message: 'Link has expired.' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = '';
        user.resetTokenExpireAt = 0;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password reset successfully.' });
    } catch (error) {
        console.log('RESET PASSWORD ERROR:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};