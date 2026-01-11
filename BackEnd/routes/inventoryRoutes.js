const express = require('express');
const supabase = require('../config/supabaseClient');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all items (Search, Filter, Pagination)
router.get('/', async (req, res) => {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    // If limit=0 or similar logic needed for "all", handle distinct via separate endpoint or logic
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    try {
        let query = supabase
            .from('inventory')
            .select('*', { count: 'exact' })
            .order('last_updated', { ascending: false });

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }
        if (category) {
            query = query.eq('category', category);
        }

        const { data, count, error } = await query.range(start, end);

        if (error) throw error;

        res.json({
            data,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Categories List (For Filter)
router.get('/categories', async (req, res) => {
    try {
        // Supabase doesn't support SELECT DISTINCT directly easily in v1 via JS client cleanly without stored params or RPC usually,
        // but we can fetch all and distinct in JS or use .select('category') and process.
        // Or better, use an RPC function if strict. For simplicity/exam:
        const { data, error } = await supabase.from('inventory').select('category');
        if (error) throw error;

        // JS Set for unique
        const categories = [...new Set(data.map(item => item.category))];
        const categoriesWithCount = categories.map(cat => ({
            name: cat,
            count: data.filter(d => d.category === cat).length
        }));

        res.json(categoriesWithCount);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add item (Admin Only)
router.post('/', verifyToken, checkRole('admin'), async (req, res) => {
    const { name, category, quantity, location } = req.body;
    try {
        const { data, error } = await supabase
            .from('inventory')
            .insert([{ name, category, quantity, location }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update item (Admin Only)
router.patch('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    const { id } = req.params;
    const { name, category, quantity, location } = req.body;
    try {
        const { data, error } = await supabase
            .from('inventory')
            .update({ name, category, quantity, location, last_updated: new Date() })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete item (Admin Only)
router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('inventory')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
