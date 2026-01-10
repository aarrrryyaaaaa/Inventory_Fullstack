import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Box, Moon, Sun, Globe } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Use AuthContext
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLanguage();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });

            if (response.data) {
                // Use AuthContext login method
                login(response.data.token, response.data.user);
                navigate('/dashboard');
            }
        } catch (error) {
            alert(t('login_failed') + ': ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white transition-colors">
            {/* Left Side - Full Half-Screen Spline */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#000000] flex-col justify-start items-center relative overflow-hidden transition-colors">
                <div className="absolute inset-0 z-0">
                    <iframe
                        src='https://my.spline.design/100followersfocus-sFBe8s2vssVBJlpaficPlaOp/'
                        frameBorder='0'
                        className="absolute w-[140%] h-[140%] -left-[20%] -top-[20%] pointer-events-auto"
                        title="Interactive 3D Scene"
                    ></iframe>
                </div>

                {/* Smooth transition gradient to the form side */}
                <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-slate-50 via-slate-50/20 to-transparent z-10 pointer-events-none"></div>

                <div className="relative z-20 text-center pointer-events-none pt-20 px-12">
                    <h1 className="text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl uppercase">
                        Halo<br />{t('welcome')}
                    </h1>
                    <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 shadow-xl inline-block mt-4">
                        <p className="text-slate-100 font-bold text-lg">
                            {t('welcome_message')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Premium Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative bg-slate-50 transition-colors">
                <div className="absolute top-8 right-8 flex gap-2">
                    <button
                        onClick={toggleLang}
                        className="p-3 rounded-2xl bg-white shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold text-xs flex items-center gap-2"
                    >
                        <Globe size={18} className="text-indigo-600" />
                        {lang.toUpperCase()}
                    </button>
                </div>

                <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">A</div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">ATS Inventory</h2>
                    </div>

                    <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">{t('login_title')}</h2>
                    <p className="text-slate-400 font-medium mb-10">{t('login_subtitle')}</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-indigo-600">{t('username')}</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                placeholder={t('username')}
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-indigo-600">{t('password')}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all pr-12 font-medium"
                                    placeholder={t('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-200 transform hover:-translate-y-1 active:translate-y-0"
                        >
                            {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Loading...</span> : t('login_title')}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-400 font-medium mb-4">{t('dont_have_account')}</p>
                        <Link
                            to="/signup"
                            className="w-full bg-slate-50 border border-slate-100 text-slate-700 font-bold py-4 rounded-2xl hover:bg-white hover:border-indigo-100 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group"
                        >
                            {t('create_account')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
