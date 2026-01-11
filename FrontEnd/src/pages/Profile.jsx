import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { User, Save, Lock, Camera, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';

const Profile = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        age: '',
        address: '',
        first_name: '',
        last_name: ''
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Pre-fill form with current user data from AuthContext (or fetch fresh)
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                username: user.username || '',
                age: user.age || '',
                address: user.address || '',
                first_name: user.first_name || '',
                last_name: user.last_name || ''
            });
        }
        fetchProfile(); // Fetch fresh data to be sure
    }, [user]);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/profile');
            setFormData(prev => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error("Error fetching profile", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.patch('/auth/profile', formData);
            alert('Profile updated successfully!');
            // Ideally update Global Auth Context here with new data
            // For now, we rely on page refresh or simple re-fetch, but let's try to update context if possible
            // Simulating context update by modifying localStorage and reloading simple way
            const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
            const updatedUser = { ...currentUser, ...response.data.user };
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
            window.location.reload();
        } catch (error) {
            alert('Error updating profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            await api.patch('/auth/change-password', {
                newPassword: passwordData.newPassword
            });
            alert('Password changed successfully!');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert('Error updating password: ' + error.message);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('File size must be less than 2MB');
                return;
            }
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handlePhotoUpload = async () => {
        if (!profilePhoto) return;

        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('photo', profilePhoto);

            const response = await api.patch('/auth/profile/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Profile photo updated successfully!');
            setProfilePhoto(null);
            setPhotoPreview(null);
            fetchProfile();
            window.location.reload(); // Refresh to update photo everywhere
        } catch (error) {
            alert('Error uploading photo: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploadingPhoto(false);
        }
    };



    return (
        <Layout title="Edit Profile">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative">
                            {photoPreview || formData.profile_photo_url ? (
                                <img
                                    src={photoPreview || formData.profile_photo_url}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-indigo-100">
                                    {formData.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200">
                                <Camera size={18} className="text-indigo-600" />
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800">Profile Photo</h2>
                            <p className="text-gray-500 text-sm mb-3">Click camera icon to upload new photo (max 2MB)</p>
                            {profilePhoto && (
                                <button
                                    onClick={handlePhotoUpload}
                                    disabled={uploadingPhoto}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                                >
                                    <Upload size={16} /> {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* General Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            <User size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">General Information</h2>
                            <p className="text-gray-500 text-sm">Update your personal details here.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        <div className="col-span-2 flex justify-end">
                            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Security</h2>
                            <p className="text-gray-500 text-sm">Change your password.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="••••••••" />
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="bg-white border border-red-200 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium">
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </Layout>
    );
};

export default Profile;
