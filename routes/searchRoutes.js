import express from 'express';
import { searchServices } from '../controller/searchController.js';

const router = express.Router();

// Public route
router.get('/', searchServices);

export default router;
