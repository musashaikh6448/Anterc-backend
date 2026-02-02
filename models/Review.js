import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    service: { // Main Service Category ID
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Service'
    },
    subServiceId: { // Create composite link to specific sub-service
        type: String,
        required: true
    },
    subServiceName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: false
    },
    enquiryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Enquiry'
    }
}, {
    timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
