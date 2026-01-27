import express from 'express';
import { getAllGalleryImages } from '../controller/galleryController.js';

const router = express.Router();

// Public route
router.get('/', getAllGalleryImages);

export default router;
