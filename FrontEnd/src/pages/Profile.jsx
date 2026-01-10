import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { User, Save, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
    const { user, login } = useAuth(); // re-login logic to update local user state if needed
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
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const token = localStorage.getItem('token');
            const response = await axios.patch('http://localhost:5000/api/auth/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/change-password', {
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Password changed successfully!');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert('Error updating password: ' + error.message);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen transition-colors">
            <Sidebar />
            <Header title="Edit Profile" />

            <main className="pl-64 pt-20 p-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* General Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {formData.username?.charAt(0).toUpperCase()}
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
            </main>
        </div>
    );
};

export default Profile;
