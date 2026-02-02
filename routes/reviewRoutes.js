import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { createReview, getAllReviews, getServiceReviews } from '../controller/reviewController.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/', protect, admin, getAllReviews);
router.get('/:subServiceId', getServiceReviews);

export default router;
