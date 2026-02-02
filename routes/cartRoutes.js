import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCart, addToCart, removeFromCart, clearCart } from '../controller/cartController.js';

const cartRoutes = express.Router();

cartRoutes.route('/')
    .get(protect, getCart)
    .delete(protect, clearCart);

cartRoutes.post('/add', protect, addToCart);
cartRoutes.delete('/:itemId', protect, removeFromCart);

export default cartRoutes;
