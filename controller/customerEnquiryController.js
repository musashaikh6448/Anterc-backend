import Enquiry from '../models/Enquiry.js';
import User from '../models/User.js';

// @desc    Create a new enquiry
// @route   POST /api/customer/enquiry
// @access  Private
    export const createEnquiry = async (req, res) => {
    const { serviceType, applianceType, message, address, city, brand, landmark } = req.body;

    try {
        // Update user's common details if provided
        const user = await User.findById(req.user._id);
        if (user) {
            if (address) user.address = address;
            if (city) user.city = city;
            if (brand) user.commonDetails = { ...user.commonDetails, brand };
            await user.save();
        }

        const enquiry = new Enquiry({
            user: req.user._id,
            serviceType,
            applianceType,
            message,
            address,
            landmark,
            city,
            state: req.body.state,
            pincode: req.body.pincode,
            brand
        });

        const createdEnquiry = await enquiry.save();
        res.status(201).json(createdEnquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user enquiries
// @route   GET /api/customer/enquiries
// @access  Private
export const getMyEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find({ user: req.user._id })
            .populate('technician', 'name phone specialization availabilityStatus')
            .sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
