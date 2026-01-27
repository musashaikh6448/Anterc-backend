import express from 'express';
import { loginAdmin, getAdminProfile } from '../controller/adminAuthController.js';
import {
    getStatistics,
    getAllEnquiries,
    updateEnquiryStatus,
    deleteEnquiry,
    getAllCustomers,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin
} from '../controller/adminController.js';
import {
    getAllServicesAdmin,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus
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

const router = express.Router();

// Auth routes
router.post('/login', loginAdmin);
router.get('/me', protect, admin, getAdminProfile);

// Statistics
router.get('/statistics', protect, admin, getStatistics);

// Enquiry routes
router.get('/enquiries', protect, admin, getAllEnquiries);
router.put('/enquiry/:id', protect, admin, updateEnquiryStatus);
router.delete('/enquiry/:id', protect, admin, deleteEnquiry);

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

// Theme management routes
router.get('/themes', protect, admin, getAllThemes);
router.put('/theme', protect, admin, updateTheme);

// Gallery management routes
router.get('/gallery', protect, admin, getAllGalleryImagesAdmin);
router.post('/gallery', protect, admin, createGalleryImage);
router.put('/gallery/:id', protect, admin, updateGalleryImage);
router.delete('/gallery/:id', protect, admin, deleteGalleryImage);

export default router;
