import express from 'express';
import { createContactEnquiry } from '../controller/contactController.js';

const router = express.Router();

router.post('/', createContactEnquiry);

export default router;
