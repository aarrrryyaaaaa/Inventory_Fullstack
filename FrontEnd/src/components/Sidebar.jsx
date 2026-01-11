import React, { useState } from 'react';
import { LayoutDashboard, Box, Tags, FileText, Moon, Sun, LogOut, Globe, Users, ArrowLeftFromLine } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [openSubmenu, setOpenSubmenu] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleSubmenu = (path) => {
        setOpenSubmenu(openSubmenu === path ? null : path);
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
        <div className={`
            fixed top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300
            w-64
            ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}
        `}>
            {/* Header / Logo Area */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="text-3xl font-black text-indigo-950 tracking-tighter">ATS</span>
                    <span className="text-3xl font-black text-cyan-400 ml-0.5">.</span>
                </div>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                    <ArrowLeftFromLine size={20} />
                </button>
            </div>

            <div className="flex-1 py-4 flex flex-col gap-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                            if (window.innerWidth < 1024) onClose(); // Close on mobile navigation
                        }}
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
