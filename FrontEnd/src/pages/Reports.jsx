import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, Package, AlertCircle, Calendar, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';

const Reports = () => {
    const { t } = useLanguage();
    const { token } = useAuth();
    const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, recentActivity: [] });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, catsRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/inventory/categories')
                ]);
                setStats(statsRes.data);
                setCategories(catsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Prepare data for Donut Chart (Category Distribution)
    const pieData = Array.isArray(categories) ? categories.map(cat => ({
        name: cat.name,
        value: cat.count
    })) : [];

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

    // Prepare data for Line Chart (Simplified from recentActivity)
    const lineData = Array.isArray(stats.recentActivity) ? stats.recentActivity.slice(0, 7).reverse().map(act => ({
        name: act.timestamp ? new Date(act.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'N/A',
        qty: act.quantity
    })) : [];

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen transition-colors font-sans">
            <Sidebar />
            <Header title={`${t('reports')} • ATS Corp`} />
            <main className="pl-64 pt-20 p-8">
                <div className="mb-10">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{t('reports')}</h2>
                    <p className="text-slate-500 font-medium">Visualized insights and technical breakdown of your inventory operations.</p>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 font-bold shadow-inner">
                                <Package size={24} />
                            </div>
                            <h3 className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-2">Total Items</h3>
                            <div className="flex items-end gap-3">
                                <p className="text-5xl font-black text-slate-900 leading-none">{stats.totalItems}</p>
                                <span className="flex items-center text-emerald-500 font-bold text-sm mb-1 bg-emerald-50 px-2 py-0.5 rounded-lg">
                                    <ArrowUpRight size={14} className="mr-0.5" /> +12%
                                </span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 font-bold shadow-inner">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-2">Critical Stock</h3>
                            <div className="flex items-end gap-3">
                                <p className="text-5xl font-black text-rose-600 leading-none">{stats.lowStock}</p>
                                <span className="flex items-center text-rose-500 font-bold text-sm mb-1 bg-rose-50 px-2 py-0.5 rounded-lg">
                                    Action Required
                                </span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 font-bold shadow-inner">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-2">System Health</h3>
                            <div className="flex items-end gap-3">
                                <p className="text-5xl font-black text-slate-900 leading-none text-emerald-600">99.8%</p>
                                <span className="flex items-center text-slate-400 font-bold text-sm mb-1">
                                    Operational
                                </span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Line Chart: Stock Flow */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Stock Flow Analysis</h3>
                                <p className="text-slate-400 text-sm font-medium">Recent transaction volumes across all locations.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                                <Calendar size={16} className="text-slate-400" />
                                <span className="text-slate-600 text-xs font-black uppercase">Weekly View</span>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={lineData}>
                                    <defs>
                                        <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                                    />
                                    <Area type="monotone" dataKey="qty" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorQty)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart: category Distribution */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Category Composition</h3>
                                <p className="text-slate-400 text-sm font-medium">Inventory distribution by product department.</p>
                            </div>
                        </div>
                        <div className="h-80 w-full flex flex-col items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                                    />
                                    <Legend
                                        iconType="circle"
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        wrapperStyle={{ fontWeight: 700, fontSize: '13px', color: '#64748b' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Data Table: Detailed Transaction Log */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Transactional Audit Trail</h3>
                            <p className="text-slate-400 font-medium">Full historical log of stock movement and user signatures.</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                                    <th className="py-5 px-8">Transaction Details</th>
                                    <th className="py-5 px-8 text-center">Type</th>
                                    <th className="py-5 px-8 text-right">Magnitude</th>
                                    <th className="py-5 px-8 text-center">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats.recentActivity?.map((act) => (
                                    <tr key={act.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-bold group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                    {act.inventory?.name?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 tracking-tight">{act.inventory?.name}</p>
                                                    <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                                        <User size={12} />
                                                        {act.users?.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-center">
                                            <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${act.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {act.type}
                                            </span>
                                        </td>
                                        <td className="py-6 px-8 text-right font-black text-slate-900">
                                            {act.type === 'IN' ? '+' : '-'}{act.quantity}
                                        </td>
                                        <td className="py-6 px-8 text-center">
                                            <span className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl">
                                                {new Date(act.timestamp).toLocaleString(undefined, {
                                                    hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
                                                })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;
