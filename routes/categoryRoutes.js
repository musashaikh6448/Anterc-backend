import express from 'express';
import {
    createCategory,
    getAllCategories,
    getAdminCategories,
    updateCategory,
    deleteCategory,
    reorderCategories
} from '../controller/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);

// Admin routes
router.post('/', protect, admin, createCategory);
router.get('/admin', protect, admin, getAdminCategories);
router.put('/reorder', protect, admin, reorderCategories);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
