import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Header = ({ title }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [showProfile, setShowProfile] = useState(false);

    // Debug user
    console.log('Header User:', user);

    return (
        <div className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4 fixed top-0 right-0 left-64 z-10 transition-colors duration-300">
            <div>
                <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">ATS Corp</h1>
                <div className="text-sm text-gray-400 font-medium flex gap-2">
                    <span>{title}</span>
                </div>
            </div>

            <div className="flex items-center gap-6">


                <div className="flex items-center gap-4 relative">
                    {/* Navigation buttons removed per request */}


                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors"
                        >
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold border border-indigo-200">
                                {user?.username?.charAt(0).toUpperCase() || <User size={20} />}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-bold text-gray-700">{user?.full_name || 'Guest'}</p>
                                <p className="text-xs text-gray-400 capitalize">{user?.role || 'Visitor'}</p>
                            </div>
                            <ChevronDown size={16} className="text-gray-400" />
                        </button>

                        {showProfile && user && (
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                                <div className="flex flex-col items-center mb-4 pb-4 border-b border-gray-100">
                                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-2xl mb-2">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="font-bold text-lg">{user?.full_name}</h3>
                                    <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full capitalize">{user?.role}</span>
                                </div>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">{t('profile_username')}</span>
                                        <span className="font-medium">{user?.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">{t('profile_age')}</span>
                                        <span className="font-medium">{user?.age || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">{t('profile_address')}</span>
                                        <span className="font-medium text-right max-w-[150px] truncate">{user?.address || '-'}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <Link to="/profile" className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-colors">
                                            Edit Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                        {showProfile && !user && (
                            <div className="absolute right-0 mt-2 w-48 bg-white p-4 shadow-xl rounded-2xl z-50 text-center text-gray-500">
                                Please login to view profile.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
