import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Verify phone number exists
// @route   POST /api/password-reset/verify-phone
// @access  Public
export const verifyPhone = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        const user = await User.findOne({ phone, role: 'customer' });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this phone number' });
        }

        res.json({ message: 'Phone number verified', exists: true });
    } catch (error) {
        console.error('Verify phone error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset password
// @route   POST /api/password-reset/reset
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { phone, newPassword } = req.body;

        if (!phone || !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({ phone, role: 'customer' });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this phone number' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Use findByIdAndUpdate with $set to bypass the pre-save middleware
        // This prevents double hashing
        await User.findByIdAndUpdate(user._id, { $set: { password: hashedPassword } });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

