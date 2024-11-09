import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, storage } from '../lib/firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Mail, Lock, Upload, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Maximum dimensions
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Compress image
      const compressedImage = await compressImage(file);
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      const snapshot = await uploadBytes(storageRef, compressedImage);
      const photoURL = await getDownloadURL(snapshot.ref);

      // Update user profile
      await updateProfile(user, { photoURL });
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error(error.message || 'Failed to update profile picture');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Update display name if changed
      if (form.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: form.displayName,
        });
      }

      // Update email if changed
      if (form.email !== user.email) {
        await updateEmail(user, form.email);
      }

      // Update password if provided
      if (form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        await updatePassword(user, form.newPassword);
      }

      toast.success('Profile updated successfully');
      setForm({ ...form, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

        {/* Profile Picture Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="h-16 w-16 text-purple-600" />
              </div>
            )}
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors"
            >
              {uploadingPhoto ? (
                <Upload className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Camera className="h-4 w-4 text-white" />
              )}
              <input
                id="photo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Click the camera icon to change your profile picture
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}