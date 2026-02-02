import express from 'express';
import { loginAdmin, getAdminProfile } from '../controller/adminAuthController.js';
import {
    getStatistics,
    getAllEnquiries,
    updateEnquiryStatus,
    uploadInvoice,
    assignTechnician,
    deleteEnquiry,
    getAllCustomers,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin
} from '../controller/adminController.js';
import {
    getAllContactEnquiries,
    getContactEnquiryById,
    deleteContactEnquiry
} from '../controller/contactController.js';
import {
    getAllServicesAdmin,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    reorderSubServices
} from '../controller/serviceController.js';
import {
    getAllThemes,
    updateTheme
} from '../controller/themeController.js';
import {
    getAllGalleryImagesAdmin,
    createGalleryImage,
    updateGalleryImage,
    deleteGalleryImage
} from '../controller/galleryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../utils/multer.js';

const router = express.Router();

// Auth routes
router.post('/login', loginAdmin);
router.get('/me', protect, admin, getAdminProfile);

// Statistics
router.get('/statistics', protect, admin, getStatistics);

// Enquiry routes
router.get('/enquiries', protect, admin, getAllEnquiries);
router.put('/enquiry/:id', protect, admin, updateEnquiryStatus);
router.put('/enquiry/:id/assign', protect, admin, assignTechnician);
router.post('/enquiry/:id/invoice', protect, admin, upload.single('invoice'), uploadInvoice);
router.delete('/enquiry/:id', protect, admin, deleteEnquiry);

// Contact Enquiry routes
router.get('/contact-enquiries', protect, admin, getAllContactEnquiries);
router.get('/contact-enquiries/:id', protect, admin, getContactEnquiryById);
router.delete('/contact-enquiries/:id', protect, admin, deleteContactEnquiry);

// Customer routes
router.get('/customers', protect, admin, getAllCustomers);

// Admin management routes
router.get('/admins', protect, admin, getAllAdmins);
router.post('/admins', protect, admin, createAdmin);
router.put('/admins/:id', protect, admin, updateAdmin);
router.delete('/admins/:id', protect, admin, deleteAdmin);

// Service management routes
router.get('/services', protect, admin, getAllServicesAdmin);
router.post('/services', protect, admin, createService);
router.put('/services/:id', protect, admin, updateService);
router.delete('/services/:id', protect, admin, deleteService);
router.put('/services/:id/toggle', protect, admin, toggleServiceStatus);
router.put('/services/:id/reorder-subservices', protect, admin, reorderSubServices);

// Theme management routes
router.get('/themes', protect, admin, getAllThemes);
router.put('/theme', protect, admin, updateTheme);

// Gallery management routes
router.get('/gallery', protect, admin, getAllGalleryImagesAdmin);
router.post('/gallery', protect, admin, createGalleryImage);
router.put('/gallery/:id', protect, admin, updateGalleryImage);
router.delete('/gallery/:id', protect, admin, deleteGalleryImage);

export default router;
