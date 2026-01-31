import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing! Invoice uploads will fail.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ensureBucketExists = async () => {
    try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.find(b => b.name === 'invoices');

        if (!bucketExists) {
            console.log('Creating invoices bucket...');
            const { data, error } = await supabase.storage.createBucket('invoices', {
                public: true,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
            });
            if (error) throw error;
            console.log('Invoices bucket created successfully');
        }
    } catch (error) {
        console.error('Error checking/creating bucket:', error);
        // Continue anyway, maybe it exists but listing failed
    }
};

export const uploadFileToSupabase = async (fileBuffer, fileName, mimetype) => {
    try {
        await ensureBucketExists();

        // Ensure unique filename to prevent overwrites
        const uniqueFileName = `${Date.now()}_${fileName}`;

        const { data, error } = await supabase
            .storage
            .from('invoices')
            .upload(uniqueFileName, fileBuffer, {
                contentType: mimetype,
                upsert: false
            });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: publicUrlData } = supabase
            .storage
            .from('invoices')
            .getPublicUrl(uniqueFileName);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Supabase upload error:', error);
        throw new Error('Failed to upload to Supabase: ' + error.message);
    }
};

export default supabase;
