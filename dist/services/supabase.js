"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const crypto_1 = require("crypto");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'images';
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
class SupabaseService {
    static async uploadImage(file, fileName, folder = 'uploads') {
        try {
            const fileExtension = fileName.split('.').pop();
            const uniqueFileName = `${(0, crypto_1.randomUUID)()}.${fileExtension}`;
            const filePath = `${folder}/${uniqueFileName}`;
            const { data, error } = await exports.supabase.storage
                .from(bucketName)
                .upload(filePath, file, {
                contentType: this.getContentType(fileExtension || ''),
                upsert: false
            });
            if (error) {
                throw new Error(`Upload failed: ${error.message}`);
            }
            const { data: urlData } = exports.supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);
            return {
                url: urlData.publicUrl,
                path: filePath,
                id: uniqueFileName.split('.')[0]
            };
        }
        catch (error) {
            console.error('Supabase upload error:', error);
            throw error;
        }
    }
    static async deleteImage(filePath) {
        try {
            const { error } = await exports.supabase.storage
                .from(bucketName)
                .remove([filePath]);
            if (error) {
                console.error('Delete error:', error);
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Supabase delete error:', error);
            return false;
        }
    }
    static async listImages(folder = 'uploads') {
        try {
            const { data, error } = await exports.supabase.storage
                .from(bucketName)
                .list(folder);
            if (error) {
                throw new Error(`List failed: ${error.message}`);
            }
            return data?.map(file => `${folder}/${file.name}`) || [];
        }
        catch (error) {
            console.error('Supabase list error:', error);
            throw error;
        }
    }
    static getContentType(extension) {
        const contentTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml'
        };
        return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
    }
}
exports.SupabaseService = SupabaseService;
//# sourceMappingURL=supabase.js.map