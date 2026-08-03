import { httpUpload } from './http';

export const UploadService = {
  async uploadSingle(file: File): Promise<{ success: boolean; url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return httpUpload<{ success: boolean; url: string }>('upload/single', formData);
  },

  async uploadMultiple(files: File[]): Promise<{ success: boolean; urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    return httpUpload<{ success: boolean; urls: string[] }>('upload/multiple', formData);
  }
};
