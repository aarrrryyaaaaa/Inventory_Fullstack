import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Loading from '../components/Loading';

const Dashboard = () => {
    const { user, token } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, recentActivity: [] });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('Loading notes...');
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, catsRes, noteRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/inventory/categories'),
                    api.get('/settings/note')
                ]);
                setStats(statsRes.data);
                setCategories(catsRes.data);
                setNote(noteRes.data.value);
                setEditValue(noteRes.data.value);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchData();
        else setLoading(false);
    }, [token]);

    const handleSaveNote = async () => {
        try {
            await api.patch('/settings/note', { value: editValue });
            setNote(editValue);
            setIsEditing(false);
        } catch (err) {
            alert('Failed to save note');
        }
    };


    const activityList = Array.isArray(stats.recentActivity) ? stats.recentActivity : [];
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

    // Data fetching handled in useEffect


    return (
        <div className="bg-gray-50 min-h-screen transition-colors">
            <Sidebar />
            <Header title={`${t('dashboard')} • ATS Corp`} />

            <main className="pl-64 pt-20 p-8">
                <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl mb-8">
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-3xl font-bold mb-2">{t('welcome')}</h1>
                        <h2 className="text-4xl font-extrabold mb-6 text-white uppercase">
                            {user?.full_name || 'User'}
                        </h2>
                        <p className="text-blue-100 mb-8 leading-relaxed">
                            {t('welcome_message')}
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Highlights Chart (Bar Chart) */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Inventory Distribution</h3>
                                    <p className="text-gray-400 text-sm">Product count per category.</p>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categories}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                            {categories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">{t('recent_activity')}</h3>
                            <div className="space-y-4">
                                {activityList.map((txn, i) => (
                                    <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-indigo-100 group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black shadow-sm ${txn.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                                                {txn.type}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{txn.inventory?.name || 'Unknown Item'}</h4>
                                                <p className="text-sm text-gray-500 font-medium">{txn.quantity} Units</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{new Date(txn.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {activityList.length === 0 && <p className="text-gray-500 py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 font-medium">No recent activity detected.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Stats & Mini Cards */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800 mb-8 border-b border-gray-50 pb-4">Key Metrics</h3>
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <h4 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">{t('total_items')}</h4>
                                    <p className="text-4xl font-black text-gray-900 leading-none">{stats.totalItems}</p>
                                </div>
                                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                                    <h4 className="text-rose-400 font-bold text-xs uppercase tracking-widest mb-2">{t('low_stock')}</h4>
                                    <p className="text-4xl font-black text-rose-600 leading-none">{stats.lowStock}</p>
                                    <p className="text-rose-400 text-xs mt-2 font-bold uppercase">Restock Needed</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative group">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-black text-xs uppercase tracking-widest text-indigo-100 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-200 rounded-full animate-pulse"></div>
                                    Admin Notes
                                </h3>
                                {user?.role === 'admin' && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-[10px] font-black uppercase tracking-tighter bg-white/20 hover:bg-white/40 px-3 py-1 rounded-full border border-white/20 transition-all"
                                    >
                                        Edit Note
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder-white/40 focus:bg-white/20 outline-none transition-all resize-none h-32 font-medium"
                                        placeholder="Type administrative notes here..."
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveNote}
                                            className="flex-1 bg-white text-indigo-600 font-bold py-2 rounded-xl hover:bg-indigo-50 transition-all"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(false); setEditValue(note); }}
                                            className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-white text-lg font-bold leading-relaxed mb-6 italic whitespace-pre-wrap">
                                    "{note}"
                                </p>
                            )}
                            <div className="w-12 h-1 bg-white/30 rounded-full"></div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
