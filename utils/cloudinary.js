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

// Helper function to upload document (PDF or Image)
export const uploadDocument = async (fileData) => {
    try {
        if (!fileData) return null;

        // If it's a base64 string
        if (fileData.startsWith('data:')) {
            const isPdf = fileData.startsWith('data:application/pdf');
            
            const uploadOptions = {
                folder: 'anterc-invoices',
                resource_type: 'auto', 
                type: 'upload',
                access_mode: 'public'
            };

            // For raw files, it's good to ensure extension for proper headers
            if (isPdf) {
                uploadOptions.use_filename = true;
                uploadOptions.unique_filename = true;
                uploadOptions.filename_override = `invoice_${Date.now()}.pdf`;
            }

            const result = await cloudinary.uploader.upload(fileData, uploadOptions);
            return result.secure_url;
        }
        
        // If it's already a URL, return as is
        if (typeof fileData === 'string' && fileData.startsWith('http')) {
            return fileData;
        }
        
        return null;
    } catch (error) {
        console.error('Cloudinary document upload error:', error);
        throw new Error('Failed to upload document: ' + error.message);
    }
};

// Helper function to upload document buffer (for multer)
export const uploadDocumentBuffer = (buffer, originalname, mimetype) => {
    return new Promise((resolve, reject) => {
        const isPdf = (mimetype === 'application/pdf') || originalname.toLowerCase().trim().endsWith('.pdf');
        console.log('Uploading file:', originalname, 'MIME:', mimetype, 'Is PDF:', isPdf);
        
        const uploadOptions = {
            folder: 'anterc-invoices',
            resource_type: isPdf ? 'raw' : 'auto', // Force raw for PDFs
            type: 'upload',
            access_mode: 'public'
        };

        if (isPdf) {
            uploadOptions.use_filename = true;
            uploadOptions.unique_filename = true;
            uploadOptions.filename_override = originalname; // Multer gives us the original name
        }

        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) {
                console.error('Cloudinary stream upload error:', error);
                reject(new Error('Cloudinary upload failed: ' + error.message));
            } else {
                console.log('Cloudinary upload success:', result.secure_url);
                resolve(result.secure_url);
            }
        });

        stream.end(buffer);
    });
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
