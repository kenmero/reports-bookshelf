import { put, del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

// Define the Shape of our Storage Provider
interface StorageProvider {
    upload(file: File, filename: string): Promise<string>;
    delete(url: string): Promise<void>;
}

// 1. Vercel Blob Implementation
const VercelStorage: StorageProvider = {
    async upload(file: File, filename: string): Promise<string> {
        // Vercel Blob 'put' automatically handles upload. 
        // access: 'public' ensures it's readable.
        const blob = await put(filename, file, {
            access: 'public',
            contentType: file.type
        });
        return blob.url;
    },
    async delete(url: string): Promise<void> {
        await del(url);
    }
};

// 2. Local Filesystem Implementation
const LocalStorage: StorageProvider = {
    async upload(file: File, filename: string): Promise<string> {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Ensure filename is safe (though caller usually handles this)
        const safeFilename = path.basename(filename);
        const filePath = path.join(uploadDir, safeFilename);

        fs.writeFileSync(filePath, buffer);

        // Return public URL path
        return `/uploads/${safeFilename}`;
    },
    async delete(url: string): Promise<void> {
        // url is like '/uploads/filename.ext'
        // Need to resolve to absolute path
        if (!url.startsWith('/uploads/')) return; // Not a local file we manage

        const filename = url.replace('/uploads/', '');
        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

// 3. Export the appropriate provider based on ENV
// We check for BLOB_READ_WRITE_TOKEN which Vercel automatically sets when Blob is added.
const isVercel = !!process.env.BLOB_READ_WRITE_TOKEN;

export const storage = isVercel ? VercelStorage : LocalStorage;

export const STORAGE_TYPE = isVercel ? 'Vercel Blob' : 'Local Disk';
