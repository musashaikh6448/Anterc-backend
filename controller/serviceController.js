import Service from '../models/Service.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get service by category
// @route   GET /api/services/category/:category
// @access  Public
export const getServicesByCategory = async (req, res) => {
    try {
        const services = await Service.find({ 
            category: req.params.category,
            isActive: true 
        }).sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create service (Admin only)
// @route   POST /api/admin/services
// @access  Private (Admin)
export const createService = async (req, res) => {
    try {
        const { category, title, description, imageUrl, subServices } = req.body;

        // Upload main image if provided as base64
        let finalImageUrl = imageUrl;
        if (imageUrl && imageUrl.startsWith('data:image')) {
            finalImageUrl = await uploadImage(imageUrl);
        }

        // Upload sub-service images
        const processedSubServices = await Promise.all(
            (subServices || []).map(async (subService) => {
                let subImageUrl = subService.imageUrl || '';
                if (subService.imageUrl && subService.imageUrl.startsWith('data:image')) {
                    subImageUrl = await uploadImage(subService.imageUrl);
                }
                return {
                    name: subService.name,
                    description: subService.description,
                    price: Number(subService.price) || 0,
                    imageUrl: subImageUrl,
                    issuesResolved: subService.issuesResolved || []
                };
            })
        );

        const service = await Service.create({
            category,
            title,
            description,
            imageUrl: finalImageUrl,
            subServices: processedSubServices
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update service (Admin only)
// @route   PUT /api/admin/services/:id
// @access  Private (Admin)
export const updateService = async (req, res) => {
    try {
        const { category, title, description, imageUrl, subServices } = req.body;
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Handle main image upload
        let finalImageUrl = service.imageUrl;
        if (imageUrl && imageUrl !== service.imageUrl) {
            if (imageUrl.startsWith('data:image')) {
                // Delete old image
                if (service.imageUrl) {
                    await deleteImage(service.imageUrl);
                }
                finalImageUrl = await uploadImage(imageUrl);
            } else {
                finalImageUrl = imageUrl;
            }
        }

        // Handle sub-service images
        const processedSubServices = await Promise.all(
            (subServices || []).map(async (subService, index) => {
                let subImageUrl = subService.imageUrl || '';
                const existingSubService = service.subServices[index];
                
                if (subService.imageUrl && subService.imageUrl !== existingSubService?.imageUrl) {
                    if (subService.imageUrl.startsWith('data:image')) {
                        // Delete old image if exists
                        if (existingSubService?.imageUrl) {
                            await deleteImage(existingSubService.imageUrl);
                        }
                        subImageUrl = await uploadImage(subService.imageUrl);
                    } else {
                        subImageUrl = subService.imageUrl;
                    }
                } else if (existingSubService) {
                    subImageUrl = existingSubService.imageUrl;
                }

                return {
                    name: subService.name,
                    description: subService.description,
                    price: Number(subService.price) || 0,
                    imageUrl: subImageUrl,
                    issuesResolved: subService.issuesResolved || []
                };
            })
        );

        // Delete removed sub-service images
        if (service.subServices.length > processedSubServices.length) {
            for (let i = processedSubServices.length; i < service.subServices.length; i++) {
                if (service.subServices[i].imageUrl) {
                    await deleteImage(service.subServices[i].imageUrl);
                }
            }
        }

        service.category = category || service.category;
        service.title = title || service.title;
        service.description = description || service.description;
        service.imageUrl = finalImageUrl;
        service.subServices = processedSubServices;

        const updatedService = await service.save();
        res.json(updatedService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete service (Admin only)
// @route   DELETE /api/admin/services/:id
// @access  Private (Admin)
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Delete main image
        if (service.imageUrl) {
            await deleteImage(service.imageUrl);
        }

        // Delete sub-service images
        for (const subService of service.subServices) {
            if (subService.imageUrl) {
                await deleteImage(subService.imageUrl);
            }
        }

        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all services (Admin - includes inactive)
// @route   GET /api/admin/services
// @access  Private (Admin)
export const getAllServicesAdmin = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle service active status
// @route   PUT /api/admin/services/:id/toggle
// @access  Private (Admin)
export const toggleServiceStatus = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        service.isActive = !service.isActive;
        await service.save();

        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
