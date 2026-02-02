import Category from '../models/Category.js';
import Service from '../models/Service.js';

// @desc    Create a new category
// @route   POST /api/admin/category
// @access  Admin
export const createCategory = async (req, res) => {
    try {
        const { name, description, imageUrl, order } = req.body;

        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // Auto-assign order if not provided (put at end)
        let newOrder = order;
        if (newOrder === undefined) {
            const count = await Category.countDocuments();
            newOrder = count;
        }

        const category = await Category.create({
            name,
            description,
            imageUrl,
            order: newOrder
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all categories (sorted by order)
// @route   GET /api/public/categories
// @access  Public
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ order: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all categories for admin (including inactive)
// @route   GET /api/admin/categories
// @access  Admin
export const getAdminCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ order: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update category
// @route   PUT /api/admin/category/:id
// @access  Admin
export const updateCategory = async (req, res) => {
    try {
        const { name, description, imageUrl, isActive } = req.body;
        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            category.description = description || category.description;
            category.imageUrl = imageUrl || category.imageUrl;
            if (isActive !== undefined) category.isActive = isActive;

            const updatedCategory = await category.save();

            // If name changed, optionally update linked services (or handle relation differently)
            // For now, we assume Service model might need manual update or we just update references if loosely coupled by string
            if (name && name !== category.name) {
                 await Service.updateMany({ category: category.name }, { category: name });
            }

            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/admin/category/:id
// @access  Admin
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            // Check if services depend on this category
            const servicesCount = await Service.countDocuments({ category: category.name });
            if (servicesCount > 0) {
                 return res.status(400).json({ message: `Cannot delete. ${servicesCount} services are using this category.` });
            }

            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reorder categories
// @route   PUT /api/admin/categories/reorder
// @access  Admin
export const reorderCategories = async (req, res) => {
    try {
        const { orderedIds } = req.body; // Array of IDs in new order

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ message: 'Invalid data' });
        }

        const updates = orderedIds.map((id, index) => {
            return Category.findByIdAndUpdate(id, { order: index });
        });

        await Promise.all(updates);

        res.json({ message: 'Categories reordered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
