export declare const uploadsDir: string;
export declare class AdminUploadController {
    uploadFile(file?: {
        filename: string;
        mimetype: string;
        size: number;
    }): {
        path: string;
    };
}
