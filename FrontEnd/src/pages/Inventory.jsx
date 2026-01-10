import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Plus, Trash2, Edit2, Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Inventory = () => {
    // ... rest of component
    const { t } = useLanguage();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTxnModal, setShowTxnModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', category: '', quantity: 0, location: '' });
    const [txnData, setTxnData] = useState({ product_id: '', type: 'IN', quantity: 0 });
    const [editingId, setEditingId] = useState(null);
    const { token, user } = useAuth();

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, limit: 10 });

    useEffect(() => {
        if (token) {
            fetchItems();
            fetchCategories();
        }
    }, [token, searchQuery, selectedCategory, currentPage]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/inventory/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchItems = async () => {
        try {
            const res = await api.get('/inventory', {
                params: {
                    search: searchQuery,
                    category: selectedCategory,
                    page: currentPage,
                    limit: 10
                }
            });
            setItems(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleCategoryFilter = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // Reset to first page on filter
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/inventory/${id}`);
            fetchItems();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/inventory/${editingId}`, formData);
            } else {
                await api.post('/inventory', formData);
            }
            setShowModal(false);
            setFormData({ name: '', category: '', quantity: 0, location: '' });
            setEditingId(null);
            fetchItems();
        } catch (err) {
            console.error("API Error:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            alert(`Operation failed: ${errorMessage}`);
        }
    };

    const handleTxnSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transactions', txnData);
            setShowTxnModal(false);
            setTxnData({ product_id: '', type: 'IN', quantity: 0 });
            alert('Transaction successful!');
            fetchItems(); // Refresh stock
        } catch (err) {
            alert('Transaction failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const openEdit = (item) => {
        setFormData({ name: item.name, category: item.category, quantity: item.quantity, location: item.location });
        setEditingId(item.id);
        setShowModal(true);
    };

    const openTxn = (type) => {
        setTxnData({ ...txnData, type });
        setShowTxnModal(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen transition-colors font-sans">
            <Sidebar />
            <Header title={`${t('inventory')} • ATS Corp`} />

            <main className="pl-64 pt-20 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('inventory')}</h2>
                        <p className="text-gray-500 font-medium">Manage and track your products across all warehouses.</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => openTxn('IN')}
                            className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-2.5 rounded-2xl flex items-center gap-2 font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                            <ArrowDownCircle size={20} /> {t('incoming')}
                        </button>
                        <button
                            onClick={() => openTxn('OUT')}
                            className="bg-orange-50 text-orange-600 border border-orange-100 px-6 py-2.5 rounded-2xl flex items-center gap-2 font-bold hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                        >
                            <ArrowUpCircle size={20} /> {t('outgoing')}
                        </button>
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', category: '', quantity: 0, location: '' }); }}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                <Plus size={20} /> {t('add_item')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-medium"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryFilter}
                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-gray-600"
                        >
                            <option value="">{t('all_categories') || 'All Categories'}</option>
                            {categories.map(cat => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-5 font-black text-xs text-gray-400 uppercase tracking-widest">{t('item_name')}</th>
                                <th className="px-8 py-5 font-black text-xs text-gray-400 uppercase tracking-widest">{t('category')}</th>
                                <th className="px-8 py-5 font-black text-xs text-gray-400 uppercase tracking-widest">{t('location')}</th>
                                <th className="px-8 py-5 font-black text-xs text-gray-400 uppercase tracking-widest text-center">{t('quantity')}</th>
                                {user?.role === 'admin' && <th className="px-8 py-5 font-black text-xs text-gray-400 uppercase tracking-widest text-right">{t('actions')}</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Loading Catalog...</td></tr>
                            ) : items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-black uppercase tracking-tight">{item.category}</span>
                                    </td>
                                    <td className="px-8 py-6 text-gray-400 font-bold text-sm tracking-tight">{item.location}</td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${item.quantity < 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            }`}>
                                            {item.quantity} UNITS
                                        </span>
                                    </td>
                                    {user?.role === 'admin' && (
                                        <td className="px-8 py-6 text-right flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(item)} className="p-2.5 text-indigo-500 bg-indigo-50 border border-indigo-100 hover:bg-indigo-600 hover:text-white rounded-xl transition-all">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2.5 text-rose-500 bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white rounded-xl transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {!loading && items.length === 0 && (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold">NO ITEMS FOUND</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                        Showing {items.length} of {pagination.total} entries
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="px-6 py-2.5 bg-white border border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Previous
                        </button>
                        <div className="flex items-center px-4 font-black text-indigo-600">
                            Page {currentPage} of {totalPages || 1}
                        </div>
                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Item Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-in-center">
                            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                        <input type="number" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Item</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Transaction Modal */}
                {showTxnModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">{txnData.type === 'IN' ? 'Incoming Stock' : 'Outgoing Stock'}</h3>
                            <form onSubmit={handleTxnSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                                    <select required value={txnData.product_id} onChange={e => setTxnData({ ...txnData, product_id: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500">
                                        <option value="">-- Select Product --</option>
                                        {items.map(i => <option key={i.id} value={i.id}>{i.name} (Qty: {i.quantity})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input type="number" min="1" required value={txnData.quantity} onChange={e => setTxnData({ ...txnData, quantity: parseInt(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setShowTxnModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className={`px-4 py-2 text-white rounded-lg ${txnData.type === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                                        Confirm {txnData.type === 'IN' ? 'Incoming' : 'Outgoing'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Inventory;
