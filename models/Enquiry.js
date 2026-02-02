import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    serviceType: {
        type: String,
        required: false // Made optional for cart-based enquiries
    },
    applianceType: {
        type: String, // e.g., 'Air Conditioner', 'TV'
        required: false // Made optional for cart-based enquiries
    },
    items: [{
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        subServiceId: String,
        name: String,
        category: String,
        price: Number,
        actualPrice: Number,
        imageUrl: String,
        quantity: { type: Number, default: 1 }
    }],
    message: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    invoiceUrl: {
        type: String,
        default: ''
    },
    bookedFor: {
        type: String,
        enum: ['myself', 'others'],
        default: 'myself'
    },
    isReviewed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;
