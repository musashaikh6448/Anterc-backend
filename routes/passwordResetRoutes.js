import express from 'express';
import { verifyPhone, resetPassword } from '../controller/passwordResetController.js';

const router = express.Router();

router.post('/verify-phone', verifyPhone);
router.post('/reset', resetPassword);

export default router;
