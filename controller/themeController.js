import Theme from '../models/Theme.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

// @desc    Get active theme (Public)
// @route   GET /api/theme
// @access  Public
export const getActiveTheme = async (req, res) => {
    try {
        let theme = await Theme.findOne({ isActive: true });
        
        // If no theme exists, create a default one
        if (!theme) {
            theme = await Theme.create({
                isActive: true
            });
        }
        
        res.json(theme);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all themes (Admin)
// @route   GET /api/admin/themes
// @access  Private (Admin)
export const getAllThemes = async (req, res) => {
    try {
        const themes = await Theme.find().sort({ createdAt: -1 });
        res.json(themes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update theme (Admin)
// @route   PUT /api/admin/theme
// @access  Private (Admin)
export const updateTheme = async (req, res) => {
    try {
        const { logo, colors, banner } = req.body;
        
        let theme = await Theme.findOne({ isActive: true });
        
        if (!theme) {
            theme = await Theme.create({ isActive: true });
        }
        
        // Handle logo upload
        if (logo) {
            if (logo.imageUrl && logo.imageUrl.startsWith('data:image')) {
                // Delete old logo if exists
                if (theme.logo?.imageUrl && !theme.logo.imageUrl.startsWith('data:')) {
                    try {
                        await deleteImage(theme.logo.imageUrl);
                    } catch (error) {
                        console.error('Error deleting old logo:', error);
                    }
                }
                theme.logo.imageUrl = await uploadImage(logo.imageUrl);
            } else if (logo.imageUrl !== undefined) {
                // If setting to empty string, delete old image from Cloudinary
                if (logo.imageUrl === '' && theme.logo?.imageUrl && !theme.logo.imageUrl.startsWith('data:')) {
                    try {
                        await deleteImage(theme.logo.imageUrl);
                    } catch (error) {
                        console.error('Error deleting logo:', error);
                    }
                }
                theme.logo.imageUrl = logo.imageUrl || '';
            }
            
            if (logo.text !== undefined) theme.logo.text = logo.text || '';
            if (logo.subText !== undefined) theme.logo.subText = logo.subText || '';
        }
        
        // Handle colors - Update all color properties
        if (colors) {
            // Brand Colors
            if (colors.primary !== undefined) theme.colors.primary = colors.primary;
            if (colors.secondary !== undefined) theme.colors.secondary = colors.secondary;
            
            // Background Colors
            if (colors.background !== undefined) theme.colors.background = colors.background;
            if (colors.backgroundSecondary !== undefined) theme.colors.backgroundSecondary = colors.backgroundSecondary;
            if (colors.backgroundDark !== undefined) theme.colors.backgroundDark = colors.backgroundDark;
            
            // Text Colors
            if (colors.textPrimary !== undefined) theme.colors.textPrimary = colors.textPrimary;
            if (colors.textSecondary !== undefined) theme.colors.textSecondary = colors.textSecondary;
            if (colors.textLight !== undefined) theme.colors.textLight = colors.textLight;
            
            // Border Colors
            if (colors.border !== undefined) theme.colors.border = colors.border;
            if (colors.borderLight !== undefined) theme.colors.borderLight = colors.borderLight;
            
            // Accent Colors
            if (colors.accent !== undefined) theme.colors.accent = colors.accent;
            if (colors.accentHover !== undefined) theme.colors.accentHover = colors.accentHover;
            
            // Status Colors
            if (colors.success !== undefined) theme.colors.success = colors.success;
            if (colors.error !== undefined) theme.colors.error = colors.error;
            if (colors.warning !== undefined) theme.colors.warning = colors.warning;
            if (colors.info !== undefined) theme.colors.info = colors.info;
            
            // Button Colors
            if (colors.buttonPrimary !== undefined) theme.colors.buttonPrimary = colors.buttonPrimary;
            if (colors.buttonPrimaryHover !== undefined) theme.colors.buttonPrimaryHover = colors.buttonPrimaryHover;
            if (colors.buttonSecondary !== undefined) theme.colors.buttonSecondary = colors.buttonSecondary;
            if (colors.buttonSecondaryHover !== undefined) theme.colors.buttonSecondaryHover = colors.buttonSecondaryHover;
            
            // Link Colors
            if (colors.link !== undefined) theme.colors.link = colors.link;
            if (colors.linkHover !== undefined) theme.colors.linkHover = colors.linkHover;
            
            // Dark/Black Colors
            if (colors.dark !== undefined) theme.colors.dark = colors.dark;
            if (colors.darkHover !== undefined) theme.colors.darkHover = colors.darkHover;
        }
        
        // Handle banner upload
        if (banner) {
            if (banner.imageUrl && banner.imageUrl.startsWith('data:image')) {
                // Delete old banner if exists
                if (theme.banner?.imageUrl && !theme.banner.imageUrl.startsWith('data:')) {
                    try {
                        await deleteImage(theme.banner.imageUrl);
                    } catch (error) {
                        console.error('Error deleting old banner:', error);
                    }
                }
                theme.banner.imageUrl = await uploadImage(banner.imageUrl);
            } else if (banner.imageUrl !== undefined) {
                // If setting to empty string, delete old image from Cloudinary
                if (banner.imageUrl === '' && theme.banner?.imageUrl && !theme.banner.imageUrl.startsWith('data:')) {
                    try {
                        await deleteImage(theme.banner.imageUrl);
                    } catch (error) {
                        console.error('Error deleting banner:', error);
                    }
                }
                theme.banner.imageUrl = banner.imageUrl || '';
            }
            
            if (banner.heading !== undefined) theme.banner.heading = banner.heading || '';
            if (banner.description !== undefined) theme.banner.description = banner.description || '';
            if (banner.tag !== undefined) theme.banner.tag = banner.tag || '';
        }
        
        await theme.save();
        res.json(theme);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
