import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId).select('-password -resetToken -resetTokenExpireAt');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        const user = await UserModel.findByIdAndUpdate(
            req.userId,
            { name },           // ← this was missing — the actual fields to update
            { new: true }       // ← this is the options object
        ).select('-password -resetToken -resetTokenExpireAt');

        return res.status(200).json({ success: true, data: user, message: 'Profile updated' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await UserModel.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};