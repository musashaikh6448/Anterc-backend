import Cart from '../models/Cart.js';
import Service from '../models/Service.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { serviceId, subServiceId, name, category, price, actualPrice, imageUrl } = req.body;
        
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex(p => p.subServiceId === subServiceId);

        if (itemIndex > -1) {
            // Product exists in the cart, update the quantity?
            // User requested "no duplicate sub service in cart".
            // So we will just return message or ignore.
            return res.status(400).json({ message: 'Item already in cart' });
        } else {
            // Product does not exists in cart, add new item
            cart.items.push({
                serviceId,
                subServiceId,
                name,
                category,
                price,
                actualPrice,
                imageUrl,
                quantity: 1
            });
        }
        
        await cart.save();
        res.json(cart);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Filter out the item
        cart.items = cart.items.filter(item => item.subServiceId !== req.params.itemId);
        
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
