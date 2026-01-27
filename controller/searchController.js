import Service from '../models/Service.js';

// @desc    Search services (Public)
// @route   GET /api/search
// @access  Public
export const searchServices = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length === 0) {
            return res.json({
                services: [],
                categories: [],
                subServices: []
            });
        }

        const searchQuery = q.trim().toLowerCase();
        
        // Search in services
        const allServices = await Service.find({ isActive: true });
        
        const matchedServices = [];
        const matchedCategories = new Set();
        const matchedSubServices = [];
        
        allServices.forEach(service => {
            // Check if category matches
            const categoryMatch = service.category.toLowerCase().includes(searchQuery) ||
                                 service.title.toLowerCase().includes(searchQuery) ||
                                 service.description.toLowerCase().includes(searchQuery);
            
            if (categoryMatch) {
                matchedCategories.add(service.category);
                matchedServices.push({
                    _id: service._id,
                    category: service.category,
                    title: service.title,
                    description: service.description,
                    imageUrl: service.imageUrl,
                    categoryId: service.category.toLowerCase().replace(/\s+/g, '-')
                });
            }
            
            // Check sub-services
            if (service.subServices && service.subServices.length > 0) {
                service.subServices.forEach((subService, index) => {
                    const subMatch = subService.name.toLowerCase().includes(searchQuery) ||
                                   subService.description.toLowerCase().includes(searchQuery) ||
                                   (subService.issuesResolved && subService.issuesResolved.some(issue => 
                                       issue.toLowerCase().includes(searchQuery)
                                   ));
                    
                    if (subMatch) {
                        matchedSubServices.push({
                            _id: service._id,
                            serviceId: `${service._id}-${index}`,
                            categoryId: service.category.toLowerCase().replace(/\s+/g, '-'),
                            serviceName: service.title,
                            subServiceName: subService.name,
                            description: subService.description,
                            price: subService.price,
                            imageUrl: subService.imageUrl || service.imageUrl,
                            category: service.category
                        });
                    }
                });
            }
        });
        
        // Get unique categories
        const uniqueCategories = Array.from(matchedCategories).map(cat => {
            const service = allServices.find(s => s.category === cat);
            return {
                id: cat.toLowerCase().replace(/\s+/g, '-'),
                title: cat,
                imageUrl: service?.imageUrl || '',
                description: service?.description || ''
            };
        });
        
        res.json({
            services: matchedServices.slice(0, 10),
            categories: uniqueCategories.slice(0, 6),
            subServices: matchedSubServices.slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
