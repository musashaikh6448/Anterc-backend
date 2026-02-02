import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Service'
    },
    subServiceId: {
        type: String, // Or ObjectId if subservices have distinct IDs we want to track rigidly
        required: true
    },
    name: {
        type: String, // Sub-service name
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    actualPrice: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        default: 1
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    items: [cartItemSchema],
}, {
    timestamps: true
});

// Calculate total virtual
cartSchema.virtual('totalPrice').get(function() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
