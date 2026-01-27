import User from '../models/User.js';
import generateToken from '../utils/auth.js';

// @desc    Register a new customer
// @route   POST /api/customer/signup
// @access  Public
export const signupCustomer = async (req, res) => {
    const { name, phone, password } = req.body;

    // Validate phone number (10 digits)
    if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    try {
        const userExists = await User.findOne({ phone });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            phone,
            password,
            role: 'customer'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/customer/login
// @access  Public
export const loginCustomer = async (req, res) => {
    const { phone, password } = req.body;

    // Validate phone number (10 digits)
    if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    try {
        const user = await User.findOne({ phone });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid phone or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/customer/me
// @access  Private
export const getCustomerProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            address: user.address || '',
            city: user.city || '',
            commonDetails: user.commonDetails || {},
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
