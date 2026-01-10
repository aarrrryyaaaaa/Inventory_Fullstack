import React, { useState } from 'react';
import { LayoutDashboard, Box, Tags, FileText, Moon, Sun, LogOut, Globe, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
        { icon: Box, label: t('inventory'), path: '/inventory' },
        { icon: Tags, label: t('categories'), path: '/categories' },
        { icon: FileText, label: t('reports'), path: '/reports' },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ icon: Users, label: 'Users', path: '/users' });
    }

    return (

        <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-20 transition-colors duration-300">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
                <div className="text-2xl font-bold text-indigo-900 tracking-tighter">ATS</div>
            </div>

            <div className="flex-1 py-4 flex flex-col gap-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                    flex items-center gap-3 px-6 py-3 mx-4 rounded-xl transition-all font-medium
                    ${isActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                `}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-2">
                {/* Language Toggle */}
                <button
                    onClick={toggleLang}
                    className="w-full flex items-center gap-3 px-6 py-3 mx-4 rounded-xl text-gray-500 hover:bg-gray-50 transition-all font-medium"
                >
                    <Globe size={20} />
                    {lang === 'en' ? 'Bahasa Indonesia' : 'English'}
                </button>

                {/* Theme Toggle Removed */}

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-3 mx-4 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all font-medium"
                >
                    <LogOut size={20} />
                    {t('logout')}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
