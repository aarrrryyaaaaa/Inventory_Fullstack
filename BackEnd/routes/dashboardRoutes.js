const express = require('express');
const supabase = require('../config/supabaseClient');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/stats', verifyToken, async (req, res) => {
    try {
        // 1. Total Items
        const { count: totalItems, error: itemsError } = await supabase
            .from('inventory')
            .select('*', { count: 'exact', head: true });

        if (itemsError) throw itemsError;

        // 2. Low Stock Items (< 10)
        const { count: lowStock, error: lowStockError } = await supabase
            .from('inventory')
            .select('*', { count: 'exact', head: true })
            .lt('quantity', 10);

        if (lowStockError) throw lowStockError;

        // 3. Recent Transactions
        const { data: recentActivity, error: activityError } = await supabase
            .from('transactions')
            .select('*, inventory(name)')
            .order('timestamp', { ascending: false })
            .limit(5);

        if (activityError) throw activityError;

        res.json({
            totalItems,
            lowStock,
            recentActivity
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
