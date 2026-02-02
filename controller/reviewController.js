import Review from '../models/Review.js';
import Service from '../models/Service.js';
import Enquiry from '../models/Enquiry.js';

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { serviceId, subServiceId, rating, comment, enquiryId, subServiceName } = req.body;
        const userId = req.user._id;

        // Verify enquiry belongs to user and is completed
        const enquiry = await Enquiry.findOne({ _id: enquiryId, user: userId });
        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found or unauthorized' });
        }
        if (enquiry.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed services' });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({
            user: userId,
            enquiryId,
            subServiceId
        });

        if (existingReview) {
             // Self-healing: Check if enquiry should be marked as reviewed
             const reviewCount = await Review.countDocuments({ enquiryId });
             const totalItems = enquiry.items && enquiry.items.length > 0 ? enquiry.items.length : 1;
             
             if (reviewCount >= totalItems) {
                 enquiry.isReviewed = true;
                 await enquiry.save();
             }

            return res.status(400).json({ message: 'You have already reviewed this service' });
        }

        // Create review
        const review = await Review.create({
            user: userId,
            service: serviceId,
            subServiceId,
            subServiceName,
            rating,
            comment,
            enquiryId
        });

        // Calculate new average rating for the sub-service
        const service = await Service.findById(serviceId);
        if (service) {
            const subServiceIndex = service.subServices.findIndex(s => 
                // Flexible matching: check ID or fallback to name if ID logic differs
                (s._id && s._id.toString() === subServiceId.split('-')[0]) || 
                // Or if subServiceId is the composite "serviceId-index" we might need to parse.
                // The frontend passes exact ID usually. Let's assume subServiceId passed matches subService._id
                // Actually, our subServiceId in frontend is often "serviceId-index".
                // Let's rely on finding the subservice in the array that matches.
                // WE MUST BE CAREFUL HERE. The frontend sends `service.id` which is `serviceId-subIndex`.
                // BUT the Mongoose subService has its own `_id`.
                
                // Let's assume for now we use the index from the composite ID if it matches pattern
                // OR we find by _id if passed.
                
                // Strategy: Find all reviews for this specific subService identifier (composite) 
                // and avg them. But we need to update the Mongoose Document.
                
                // Wait, easier approach:
                // 1. Get all reviews for this `subServiceId` (which is stored as string in Review).
                // 2. Update the `subService` in `Service` model.
                
                // Correction: The `subServiceId` passed from frontend might be `composite`.
                // We stored composite `serviceId-index` in Cart.
                // Let's strip the index to find the array position?
                // Example: `6978e...-1`. The index is 1.
                 
                // Ideally, we should store `_id` of subService if available.
                // Let's rely on the fact that `subServiceId` in Review matches what we can identify in Service.
                
                // Let's just calculate average of all Reviews with this `subServiceId`
                // AND then update the `subServices` array in Service doc.
                 
                true 
            );

            // Re-calculate average
            const reviews = await Review.find({ subServiceId });
            const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            const numReviews = reviews.length;

            // We need to find WHICH subService to update in the DB array.
            // If subServiceId is "MainServiceId-Index", we parse index.
            // If subServiceId is a true MongoID, we search by ID.
            
            let matchedIndex = -1;
            if (subServiceId.includes('-')) {
                 const parts = subServiceId.split('-');
                 const potentialIndex = parseInt(parts[parts.length - 1]);
                 if (!isNaN(potentialIndex) && service.subServices[potentialIndex]) {
                     matchedIndex = potentialIndex;
                 }
            }
            
            // If strictly using _id
            if (matchedIndex === -1) {
                 matchedIndex = service.subServices.findIndex(s => s._id.toString() === subServiceId);
            }

            if (matchedIndex !== -1) {
                service.subServices[matchedIndex].rating = avgRating;
                service.subServices[matchedIndex].numReviews = numReviews;
                await service.save();
            }
        }

        // Check if all items in the enquiry are reviewed
        const reviewCount = await Review.countDocuments({ enquiryId });
        const totalItems = enquiry.items && enquiry.items.length > 0 ? enquiry.items.length : 1;

        console.log(`[DEBUG] Enquiry ${enquiryId}: Review Count = ${reviewCount}, Total Items = ${totalItems}`);

        if (reviewCount >= totalItems) {
            console.log(`[DEBUG] Marking Enquiry ${enquiryId} as Reviewed`);
            enquiry.isReviewed = true;
            await enquiry.save();
        } else {
             console.log(`[DEBUG] Enquiry ${enquiryId} NOT yet fully reviewed`);
        }

        res.status(201).json(review);
    } catch (error) {
        console.error('Review create error:', error);
        res.status(500).json({ message: 'Failed to submit review' });
    }
};

// Get all reviews (Admin)
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('user', 'name phone')
            .populate('service', 'title category')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Get All Reviews Error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
};

// Get reviews for a specific sub-service (Public - Optional if needed)
export const getServiceReviews = async (req, res) => {
    try {
        const { subServiceId } = req.params;
        const reviews = await Review.find({ subServiceId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch service reviews' });
    }
};
