export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export interface UploadResult {
    url: string;
    path: string;
    id: string;
}
export declare class SupabaseService {
    static uploadImage(file: Buffer, fileName: string, folder?: string): Promise<UploadResult>;
    static deleteImage(filePath: string): Promise<boolean>;
    static listImages(folder?: string): Promise<string[]>;
    private static getContentType;
}
//# sourceMappingURL=supabase.d.ts.map