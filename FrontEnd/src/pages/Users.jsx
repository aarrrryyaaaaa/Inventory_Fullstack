import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Layout from '../components/Layout';
import { Search, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            alert("Access Denied: Admins only.");
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            const [usersRes, onlineRes] = await Promise.all([
                api.get(`/auth/all?search=${searchTerm}`),
                api.get('/auth/online')
            ]);
            setUsers(usersRes.data.data);
            setOnlineUsers(onlineRes.data.map(u => u.id));
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/auth/users/${id}`);
            alert('User deleted successfully');
            fetchUsers();
        } catch (error) {
            alert('Delete failed: ' + (error.response?.data?.message || error.message));
        }
    };

    // Data fetching handled in useEffect


    return (
        <Layout title="User Management">
            {/* Content wrapped in Layout */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">All Registered Users</h2>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                                <th className="pb-3 px-4">Username</th>
                                <th className="pb-3 px-4">Full Name</th>
                                <th className="pb-3 px-4">Role</th>
                                <th className="pb-3 px-4">Age</th>
                                <th className="pb-3 px-4">Address</th>
                                {user?.role === 'admin' && <th className="pb-3 px-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4 font-medium text-indigo-600">{u.username}</td>
                                    <td className="py-4 px-4 flex items-center gap-3">
                                        <div className="relative">
                                            {u.profile_photo_url ? (
                                                <img src={u.profile_photo_url} alt={u.full_name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 border-2 border-gray-200">
                                                    {u.full_name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {onlineUsers.includes(u.id) && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title="Online"></div>
                                            )}
                                        </div>
                                        <span className="font-medium">{u.full_name}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600">{u.age || '-'}</td>
                                    <td className="py-4 px-4 text-gray-600 max-w-[200px] truncate">{u.address || '-'}</td>
                                    {user?.role === 'admin' && (
                                        <td className="py-4 px-4 text-right">
                                            {u.id !== user.id ? (
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all group-hover:opacity-100"
                                                    title="Delete User account"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 uppercase italic">You</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={user?.role === 'admin' ? "6" : "5"} className="text-center py-8 text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Users;
