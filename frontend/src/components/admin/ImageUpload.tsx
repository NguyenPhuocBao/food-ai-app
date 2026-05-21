import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  foodId: number;
  currentImage: string | null;
  onUploadSuccess: (imageUrl: string) => void;
}

const ImageUpload = ({ foodId, currentImage, onUploadSuccess }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  useEffect(() => {
    setPreview(currentImage);
    setUploading(false);
  }, [foodId, currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await api.post(`/foods/${foodId}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = res.data.data.imageUrl;
      setPreview(newUrl);
      onUploadSuccess(newUrl);
      toast.success('Upload ảnh thành công');
    } catch (error) {
      toast.error('Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Food"
            className="w-full max-h-64 object-contain rounded-2xl border border-gray-200 dark:border-gray-700"
          />
          <button
            onClick={() => {
              setPreview(null);
              onUploadSuccess('');
            }}
            className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <Upload size={32} className="text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">Click để upload ảnh</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      )}
      {uploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl text-white">
          Đang upload...
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
