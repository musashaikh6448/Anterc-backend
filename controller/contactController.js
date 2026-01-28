import ContactEnquiry from '../models/ContactEnquiry.js';

// @desc    Create a new contact enquiry
// @route   POST /api/contact
// @access  Public
export const createContactEnquiry = async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    try {
        const contactEnquiry = new ContactEnquiry({
            name,
            email,
            phone,
            subject,
            message
        });

        const createdEnquiry = await contactEnquiry.save();
        res.status(201).json(createdEnquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all contact enquiries
// @route   GET /api/admin/contact-enquiries
// @access  Private/Admin
export const getAllContactEnquiries = async (req, res) => {
    try {
        const enquiries = await ContactEnquiry.find({}).sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get contact enquiry by ID
// @route   GET /api/admin/contact-enquiries/:id
// @access  Private/Admin
export const getContactEnquiryById = async (req, res) => {
    try {
        const enquiry = await ContactEnquiry.findById(req.params.id);
        if (enquiry) {
            res.json(enquiry);
        } else {
            res.status(404).json({ message: 'Enquiry not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete contact enquiry
// @route   DELETE /api/admin/contact-enquiries/:id
// @access  Private/Admin
export const deleteContactEnquiry = async (req, res) => {
    try {
        const enquiry = await ContactEnquiry.findById(req.params.id);

        if (enquiry) {
            await enquiry.deleteOne();
            res.json({ message: 'Enquiry removed' });
        } else {
            res.status(404).json({ message: 'Enquiry not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
