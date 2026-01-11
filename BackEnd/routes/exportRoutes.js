const express = require('express');
const supabase = require('../config/supabaseClient');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Export transactions as CSV
router.get('/export', verifyToken, async (req, res) => {
    const { month, year } = req.query;

    try {
        let query = supabase
            .from('transactions')
            .select(`
                *,
                inventory (name, category),
                users (username)
            `)
            .order('timestamp', { ascending: false });

        // Filter by month/year if provided
        if (month && year) {
            const startDate = new Date(`${year}-${month}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);

            query = query
                .gte('timestamp', startDate.toISOString())
                .lt('timestamp', endDate.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;

        // Generate CSV
        const csvHeaders = 'Date,Time,Product,Category,Type,Quantity,User\n';
        const csvRows = data.map(txn => {
            const date = new Date(txn.timestamp);
            const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const timeStr = date.toLocaleTimeString('en-US', { hour12: false });
            const product = txn.inventory?.name || 'Unknown';
            const category = txn.inventory?.category || 'N/A';
            const type = txn.type;
            const quantity = txn.quantity;
            const user = txn.users?.username || 'Unknown';

            return `${dateStr},${timeStr},${product},${category},${type},${quantity},${user}`;
        }).join('\n');

        const csv = csvHeaders + csvRows;

        // Set headers for file download
        const filename = month && year
            ? `transactions_${year}_${month}.csv`
            : `transactions_all.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
