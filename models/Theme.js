import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
    // Logo Settings
    logo: {
        imageUrl: {
            type: String,
            default: ''
        },
        text: {
            type: String,
            default: ''
        },
        subText: {
            type: String,
            default: ''
        }
    },
    
    // Color Theme - Comprehensive color system
    colors: {
        // Brand Colors
        primary: {
            type: String,
            default: '#4f46e5' // indigo-600
        },
        secondary: {
            type: String,
            default: '#6366f1' // indigo-500
        },
        
        // Background Colors
        background: {
            type: String,
            default: '#fcfdfe' // light background
        },
        backgroundSecondary: {
            type: String,
            default: '#f8fafc' // slate-50
        },
        backgroundDark: {
            type: String,
            default: '#0f172a' // slate-900
        },
        
        // Text Colors
        textPrimary: {
            type: String,
            default: '#0f172a' // slate-900
        },
        textSecondary: {
            type: String,
            default: '#64748b' // slate-500
        },
        textLight: {
            type: String,
            default: '#ffffff' // white
        },
        
        // Border Colors
        border: {
            type: String,
            default: '#e2e8f0' // slate-200
        },
        borderLight: {
            type: String,
            default: '#f1f5f9' // slate-100
        },
        
        // Accent Colors
        accent: {
            type: String,
            default: '#6366f1' // indigo-500
        },
        accentHover: {
            type: String,
            default: '#4f46e5' // indigo-600
        },
        
        // Status Colors
        success: {
            type: String,
            default: '#10b981' // green-500
        },
        error: {
            type: String,
            default: '#ef4444' // red-500
        },
        warning: {
            type: String,
            default: '#f59e0b' // amber-500
        },
        info: {
            type: String,
            default: '#3b82f6' // blue-500
        },
        
        // Button Colors
        buttonPrimary: {
            type: String,
            default: '#4f46e5' // indigo-600
        },
        buttonPrimaryHover: {
            type: String,
            default: '#4338ca' // indigo-700
        },
        buttonSecondary: {
            type: String,
            default: '#6366f1' // indigo-500
        },
        buttonSecondaryHover: {
            type: String,
            default: '#4f46e5' // indigo-600
        },
        
        // Link Colors
        link: {
            type: String,
            default: '#4f46e5' // indigo-600
        },
        linkHover: {
            type: String,
            default: '#4338ca' // indigo-700
        },
        
        // Dark/Black Colors (for buttons, headers, etc.)
        dark: {
            type: String,
            default: '#0f172a' // slate-900
        },
        darkHover: {
            type: String,
            default: '#1e293b' // slate-800
        }
    },
    
    // Banner Settings
    banner: {
        imageUrl: {
            type: String,
            default: ''
        },
        heading: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        tag: {
            type: String,
            default: ''
        }
    },
    
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure only one active theme
themeSchema.pre('save', async function(next) {
    if (this.isActive && this.isNew) {
        await mongoose.model('Theme').updateMany({}, { isActive: false });
    }
    next();
});

const Theme = mongoose.model('Theme', themeSchema);

export default Theme;
