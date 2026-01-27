import express from 'express';
import { getActiveTheme } from '../controller/themeController.js';

const router = express.Router();

// Public route
router.get('/', getActiveTheme);

export default router;
