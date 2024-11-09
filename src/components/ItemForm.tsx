import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'poor'] as const;
const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Other'];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ItemForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    condition: '' as typeof CONDITIONS[number],
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Maximum dimensions
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not compress image'));
            }
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = () => reject(new Error('Could not load image'));
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error processing image');
      setImage(null);
      setImagePreview('');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: '',
      condition: '' as typeof CONDITIONS[number],
    });
    setImage(null);
    setImagePreview('');
    setUploadStatus('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to add items');
      return;
    }

    if (!image) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setLoading(true);
      setUploadStatus('Compressing image...');
      
      // Compress image
      const compressedImage = await compressImage(image);
      
      // Upload image
      setUploadStatus('Uploading image...');
      const storageRef = ref(storage, `items/${user.uid}/${Date.now()}-${image.name}`);
      const snapshot = await uploadBytes(storageRef, compressedImage);
      
      setUploadStatus('Getting image URL...');
      const imageUrl = await getDownloadURL(snapshot.ref);

      // Add document to Firestore
      setUploadStatus('Saving item details...');
      await addDoc(collection(db, 'items'), {
        ...form,
        imageUrl,
        userId: user.uid,
        createdAt: Date.now(),
        status: 'available',
      });

      toast.success('Item added successfully!');
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast.error(error.message || 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
      setUploadStatus('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Image</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-500 transition-colors cursor-pointer">
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg" />
            ) : (
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                <span>{imagePreview ? 'Change image' : 'Upload a file'}</span>
                <input 
                  type="file" 
                  className="sr-only" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  required
                  disabled={loading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          required
          className="input mt-1"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Enter item title"
          minLength={3}
          maxLength={100}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          required
          rows={3}
          className="input mt-1"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe your item"
          minLength={10}
          maxLength={500}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            required
            className="input mt-1"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            disabled={loading}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <select
            required
            className="input mt-1"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value as typeof CONDITIONS[number] })}
            disabled={loading}
          >
            <option value="">Select condition</option>
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {uploadStatus && (
          <div className="text-sm text-purple-600 text-center">
            <Loader className="inline-block animate-spin h-4 w-4 mr-2" />
            {uploadStatus}
          </div>
        )}
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="w-1/3 btn bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-2/3 btn btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </>
            ) : (
              'Add Item'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}