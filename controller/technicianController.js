import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get all technicians
// @route   GET /api/technicians
// @access  Private (Admin)
export const getTechnicians = async (req, res) => {
    try {
        const technicians = await User.find({ role: 'technician' }).select('-password');
        res.json(technicians);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a technician
// @route   POST /api/technicians
// @access  Private (Admin)
export const createTechnician = async (req, res) => {
    const { name, phone, password, specialization } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    try {
        const userExists = await User.findOne({ phone });

        if (userExists) {
            return res.status(400).json({ message: 'User with this phone number already exists' });
        }

        const technician = await User.create({
            name,
            phone,
            password,
            role: 'technician',
            specialization: specialization || 'General',
            availabilityStatus: 'available'
        });

        const { password: _, ...techWithoutPassword } = technician.toObject();
        res.status(201).json(techWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update technician
// @route   PUT /api/technicians/:id
// @access  Private (Admin)
export const updateTechnician = async (req, res) => {
    const { name, phone, password, specialization, availabilityStatus } = req.body;

    try {
        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        // Check availability if phone is changed
        if (phone) {
            const existingUser = await User.findOne({ phone, _id: { $ne: req.params.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
        }

        const updateData = { name, phone, specialization, availabilityStatus };
        if (password) {
             const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Filter out undefined values
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const technician = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        res.json(technician);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete technician
// @route   DELETE /api/technicians/:id
// @access  Private (Admin)
export const deleteTechnician = async (req, res) => {
    try {
        const technician = await User.findById(req.params.id);

        if (!technician || technician.role !== 'technician') {
            return res.status(404).json({ message: 'Technician not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Technician deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
