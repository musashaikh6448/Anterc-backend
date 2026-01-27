import Gallery from '../models/Gallery.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

// @desc    Get all gallery images (Public)
// @route   GET /api/gallery
// @access  Public
export const getAllGalleryImages = async (req, res) => {
    try {
        const images = await Gallery.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all gallery images (Admin - includes inactive)
// @route   GET /api/admin/gallery
// @access  Private (Admin)
export const getAllGalleryImagesAdmin = async (req, res) => {
    try {
        const images = await Gallery.find().sort({ order: 1, createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create gallery image (Admin)
// @route   POST /api/admin/gallery
// @access  Private (Admin)
export const createGalleryImage = async (req, res) => {
    try {
        const { imageUrl, title, description, order } = req.body;
        
        let finalImageUrl = imageUrl;
        if (imageUrl && imageUrl.startsWith('data:image')) {
            finalImageUrl = await uploadImage(imageUrl);
        }
        
        const galleryImage = await Gallery.create({
            imageUrl: finalImageUrl,
            title: title || '',
            description: description || '',
            order: order || 0
        });
        
        res.status(201).json(galleryImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update gallery image (Admin)
// @route   PUT /api/admin/gallery/:id
// @access  Private (Admin)
export const updateGalleryImage = async (req, res) => {
    try {
        const { imageUrl, title, description, order, isActive } = req.body;
        const galleryImage = await Gallery.findById(req.params.id);
        
        if (!galleryImage) {
            return res.status(404).json({ message: 'Gallery image not found' });
        }
        
        // Handle image upload
        if (imageUrl && imageUrl !== galleryImage.imageUrl) {
            if (imageUrl.startsWith('data:image')) {
                // Delete old image
                if (galleryImage.imageUrl) {
                    await deleteImage(galleryImage.imageUrl);
                }
                galleryImage.imageUrl = await uploadImage(imageUrl);
            } else {
                galleryImage.imageUrl = imageUrl;
            }
        }
        
        if (title !== undefined) galleryImage.title = title;
        if (description !== undefined) galleryImage.description = description;
        if (order !== undefined) galleryImage.order = order;
        if (isActive !== undefined) galleryImage.isActive = isActive;
        
        await galleryImage.save();
        res.json(galleryImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete gallery image (Admin)
// @route   DELETE /api/admin/gallery/:id
// @access  Private (Admin)
export const deleteGalleryImage = async (req, res) => {
    try {
        const galleryImage = await Gallery.findById(req.params.id);
        
        if (!galleryImage) {
            return res.status(404).json({ message: 'Gallery image not found' });
        }
        
        // Delete image from Cloudinary
        if (galleryImage.imageUrl) {
            await deleteImage(galleryImage.imageUrl);
        }
        
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Gallery image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
