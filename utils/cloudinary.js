import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnfmlvrek',
    api_key: process.env.CLOUDINARY_API_KEY || '543536958711119',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'r48R-gMVhkONwb48HzmM3rxX6eU',
});

// Helper function to upload image from base64 or URL
export const uploadImage = async (imageData) => {
    try {
        // If it's a base64 string
        if (imageData && imageData.startsWith('data:image')) {
            const result = await cloudinary.uploader.upload(imageData, {
                folder: 'anterc-services',
                transformation: [
                    { width: 800, height: 800, crop: 'fill', gravity: 'auto', quality: 'auto' }
                ],
                resource_type: 'image'
            });
            return result.secure_url;
        }
        // If it's already a URL, return as is
        if (imageData && typeof imageData === 'string') {
            return imageData;
        }
        return null;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image: ' + error.message);
    }
};

// Helper function to delete image
export const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl) return;
        
        // Extract public_id from URL
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            // Get everything after 'upload'
            const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
            // Remove file extension
            const publicId = pathAfterUpload.split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error('Failed to delete image:', error);
    }
};

export default cloudinary;
