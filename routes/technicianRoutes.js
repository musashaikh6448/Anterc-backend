import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getTechnicians,
    createTechnician,
    updateTechnician,
    deleteTechnician
} from '../controller/technicianController.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.route('/')
    .get(getTechnicians)
    .post(createTechnician);

router.route('/:id')
    .put(updateTechnician)
    .delete(deleteTechnician);

export default router;
