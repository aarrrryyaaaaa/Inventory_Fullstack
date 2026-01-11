import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, Box, Calendar, User, Tag } from 'lucide-react';
import Loading from '../components/Loading';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const { t } = useLanguage();

    useEffect(() => {
        if (token) fetchCats();
    }, [token]);

    const fetchCats = async () => {
        try {
            const res = await api.get('/inventory/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Data fetching handled in useEffect


    const handleCategoryClick = async (catName) => {
        setSelectedCategory(catName);
        setLoadingProducts(true);
        try {
            // Fetch products for this category (limit 100 for detail view)
            const res = await api.get(`/inventory`, {
                params: { category: catName, limit: 100 }
            });
            setProducts(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingProducts(false);
        }
    };

    return (
        <Layout title={`${t('categories')} • ATS Corp`}>

            {selectedCategory ? (
                <div>
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold mb-6 transition-colors"
                    >
                        <ChevronLeft size={20} />
                        Back to Categories
                    </button>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                                <Tag size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">{selectedCategory}</h2>
                                <p className="text-gray-500 font-medium">{products.length} Products in this category</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                                        <th className="pb-4 px-4 font-black">Product Name</th>
                                        <th className="pb-4 px-4 font-black text-center">Current Stock</th>
                                        <th className="pb-4 px-4 font-black text-center">Last Updated</th>
                                        <th className="pb-4 px-4 font-black">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loadingProducts ? (
                                        <tr><td colSpan="4" className="text-center py-10 text-gray-400 font-medium">Loading products...</td></tr>
                                    ) : products.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shadow-sm">
                                                        <Box size={20} />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${item.quantity <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                                    }`}>
                                                    {item.quantity} units
                                                </span>
                                            </td>
                                            <td className="py-5 px-4 text-center text-sm font-medium text-gray-500">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Calendar size={14} className="text-gray-300" />
                                                    {new Date(item.last_updated).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                                    {item.location || 'Warehouse A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && !loadingProducts && (
                                        <tr><td colSpan="4" className="text-center py-10 text-gray-500">No products found in this category.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('categories')}</h2>
                    <p className="text-gray-500 font-medium mb-8">Browse products by their department or group.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.isArray(categories) && categories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleCategoryClick(cat.name)}
                                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all text-left flex flex-col group"
                            >
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">
                                    📦
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{cat.name}</h3>
                                <div className="mt-auto flex items-center justify-between">
                                    <p className="text-gray-400 font-bold text-sm tracking-widest">{cat.count} ITEMS</p>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                        <ChevronLeft size={16} className="rotate-180" />
                                    </div>
                                </div>
                            </button>
                        ))}
                        {categories.length === 0 && <p className="text-gray-500">No categories found.</p>}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Categories;
