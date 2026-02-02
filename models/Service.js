import mongoose from 'mongoose';

const subServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    actualPrice: {
        type: Number,
        required: false
    },
    imageUrl: {
        type: String,
        required: true
    },
    issuesResolved: [{
        type: String
    }]
}, { _id: true });

const serviceSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: [
            'Air Conditioner',
            'Electrician',
            'Plumbing',
            'Washing Machine',
            'TV',
            'Refrigerator',
            'Deep Freezer',
            'Ceiling & Table Fan',
            'Water Purifier',
            'Dishwasher',
            'Dispenser',
            'Visi Cooler',
            'Water Cooler',
            'Air Cooler',
            'CCTV Camera',
            'Computer & Laptop',
            'Printer',
            'Stabilizer',
            'Chimneys',
            'Microwave oven',
            'Electric Induction',
            'Geysers',
            'Home theatre/ Sound box',
            'Inverter Batteries',
            'Vacuum cleaner'
        ]
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    subServices: [subServiceSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
