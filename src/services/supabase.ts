import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'images';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface UploadResult {
  url: string;
  path: string;
  id: string;
}

export class SupabaseService {
  static async uploadImage(
    file: Buffer,
    fileName: string,
    folder: string = 'uploads'
  ): Promise<UploadResult> {
    try {
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${randomUUID()}.${fileExtension}`;
      const filePath = `${folder}/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: this.getContentType(fileExtension || ''),
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        id: uniqueFileName.split('.')[0]
      };
    } catch (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
  }

  static async deleteImage(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Supabase delete error:', error);
      return false;
    }
  }

  static async listImages(folder: string = 'uploads'): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder);

      if (error) {
        throw new Error(`List failed: ${error.message}`);
      }

      return data?.map(file => `${folder}/${file.name}`) || [];
    } catch (error) {
      console.error('Supabase list error:', error);
      throw error;
    }
  }

  private static getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
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