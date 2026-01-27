import express from 'express';
import { signupCustomer, loginCustomer, getCustomerProfile } from '../controller/customerAuthController.js';
import { createEnquiry, getMyEnquiries } from '../controller/customerEnquiryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupCustomer);
router.post('/login', loginCustomer);
router.get('/me', protect, getCustomerProfile);
router.post('/enquiry', protect, createEnquiry);
router.get('/enquiries', protect, getMyEnquiries);

export default router;
