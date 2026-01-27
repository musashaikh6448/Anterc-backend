import express from 'express';
import {
    getAllServices,
    getServicesByCategory,
    getServiceById
} from '../controller/serviceController.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', getServiceById);

export default router;
