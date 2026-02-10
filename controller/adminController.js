import User from '../models/User.js';
import Enquiry from '../models/Enquiry.js';
import { uploadDocument } from '../utils/cloudinary.js';
import { uploadFileToSupabase } from '../utils/supabase.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/statistics
// @access  Private (Admin)
export const getStatistics = async (req, res) => {
    try {
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalEnquiries = await Enquiry.countDocuments();
        const pendingEnquiries = await Enquiry.countDocuments({ status: 'pending' });
        const inProgressEnquiries = await Enquiry.countDocuments({ status: 'in-progress' });
        const completedEnquiries = await Enquiry.countDocuments({ status: 'completed' });
        const cancelledEnquiries = await Enquiry.countDocuments({ status: 'cancelled' });

        res.json({
            totalCustomers,
            totalAdmins,
            totalEnquiries,
            pendingEnquiries,
            inProgressEnquiries,
            completedEnquiries,
            cancelledEnquiries
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all enquiries
// @route   GET /api/admin/enquiries
// @access  Private (Admin)
export const getAllEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find()
            .populate('user', 'name phone')
            .sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update enquiry status
// @route   PUT /api/admin/enquiry/:id
// @access  Private (Admin)
export const updateEnquiryStatus = async (req, res) => {
    try {
        const { status, invoiceUrl } = req.body;
        const updateData = {};

        if (status) updateData.status = status;
        
        if (invoiceUrl) {
            // If it's a base64 string, upload it
            if (invoiceUrl.startsWith('data:')) {
                const uploadedUrl = await uploadDocument(invoiceUrl);
                if (uploadedUrl) {
                    updateData.invoiceUrl = uploadedUrl;
                }
            } else {
                // Determine if we should clear it or keep it (if passed as string)
                updateData.invoiceUrl = invoiceUrl;
            }
        }

        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('user', 'name phone');

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.json(enquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload invoice for enquiry
// @route   POST /api/admin/enquiry/:id/invoice
// @access  Private (Admin)
export const uploadInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        console.log('Received file for upload:', file.originalname, file.mimetype);



        // Upload to Supabase instead of Cloudinary
        const imageUrl = await uploadFileToSupabase(file.buffer, file.originalname, file.mimetype);

        const updatedEnquiry = await Enquiry.findByIdAndUpdate(
            id,
            { invoiceUrl: imageUrl },
            { new: true }
        ).populate('user', 'name phone');

        if (!updatedEnquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.json(updatedEnquiry);
    } catch (error) {
        res.status(500).json({ message: 'Error uploading invoice', error: error.message });
    }
};

// @desc    Assign technician to enquiry
// @route   PUT /api/admin/enquiry/:id/assign
// @access  Private (Admin)
export const assignTechnician = async (req, res) => {
    try {
        const { technicianId } = req.body;
        const { id } = req.params;

        const enquiry = await Enquiry.findById(id);
        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        const technician = await User.findById(technicianId);
        if (!technician || technician.role !== 'technician') {
            return res.status(404).json({ message: 'Technician not found or invalid' });
        }

        enquiry.technician = technicianId;
        
        // Auto-update status to 'technician assigned' if it was pending
        if (enquiry.status === 'pending') {
            enquiry.status = 'technician assigned';
        }

        await enquiry.save();

        const updatedEnquiry = await Enquiry.findById(id)
            .populate('user', 'name phone')
            .populate('technician', 'name phone specialization');

        res.json(updatedEnquiry);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning technician', error: error.message });
    }
};

// @desc    Delete enquiry
// @route   DELETE /api/admin/enquiry/:id
// @access  Private (Admin)


export const deleteEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id);

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        await Enquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private (Admin)
export const getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private (Admin)
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create admin
// @route   POST /api/admin/admins
// @access  Private (Admin)
export const createAdmin = async (req, res) => {
    const { name, phone, password } = req.body;

    // Validate phone number (10 digits)
    if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    try {
        const userExists = await User.findOne({ phone });

        const user = await User.create({
            name,
            phone,
            password,
            role: 'admin'
        });

        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update admin
// @route   PUT /api/admin/admins/:id
// @access  Private (Admin)
export const updateAdmin = async (req, res) => {
    const { name, phone, password } = req.body;

    try {
        // Validate phone number if provided
        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        // Check if phone is already taken by another user
        if (phone) {
            const existingUser = await User.findOne({ phone, _id: { $ne: req.params.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
        }

        const updateData = { name, phone };
        if (password) {
            updateData.password = password;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete admin
// @route   DELETE /api/admin/admins/:id
// @access  Private (Admin)
export const deleteAdmin = async (req, res) => {
    try {
        // Prevent deleting yourself
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({ message: 'User is not an admin' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
