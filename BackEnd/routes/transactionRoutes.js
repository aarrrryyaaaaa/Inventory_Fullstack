const express = require('express');
const supabase = require('../config/supabaseClient');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// GET ALL TRANSACTIONS (Filtered, Paginated)
router.get('/', verifyToken, async (req, res) => {
    const { page = 1, limit = 10, type } = req.query;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    try {
        let query = supabase
            .from('transactions')
            .select(`
                *,
                inventory (name),
                users (username, profile_photo_url)
            `, { count: 'exact' })
            .order('timestamp', { ascending: false });

        if (type) {
            query = query.eq('type', type);
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

// CREATE TRANSACTION (IN/OUT)
router.post('/', verifyToken, async (req, res) => {
    const { product_id, type, quantity } = req.body; // type: 'IN' or 'OUT'
    const qty = parseInt(quantity);

    if (qty <= 0) {
        return res.status(400).json({ message: 'Quantity must be positive' });
    }

    try {
        // 1. Get current stock
        const { data: item, error: itemError } = await supabase
            .from('inventory')
            .select('quantity')
            .eq('id', product_id)
            .single();

        if (itemError || !item) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 2. Calculate new stock
        let newQuantity = item.quantity;
        if (type === 'IN') {
            newQuantity += qty;
        } else if (type === 'OUT') {
            if (item.quantity < qty) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }
            newQuantity -= qty;
        } else {
            return res.status(400).json({ message: 'Invalid transaction type' });
        }

        // 3. Update Inventory
        const { error: updateError } = await supabase
            .from('inventory')
            .update({ quantity: newQuantity, last_updated: new Date() })
            .eq('id', product_id);

        if (updateError) throw updateError;

        // 4. Record Transaction
        const { data: txn, error: txnError } = await supabase
            .from('transactions')
            .insert([{
                product_id,
                user_id: req.userId,
                type,
                quantity: qty
            }])
            .select();

        if (txnError) throw txnError;

        res.status(201).json({ message: 'Transaction successful', transaction: txn[0], current_stock: newQuantity });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE TRANSACTION (Admin Only - Optional per req "Menghapus transaksi (hanya admin)")
// Note: This does NOT revert stock merely deletes the log, unless specified otherwise. 
// Usually deleting a transaction log shouldn't revert stock automatically unless complex logic. 
// I'll keep it simple: delete log only.
router.delete('/:id', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    try {
        const { error } = await supabase.from('transactions').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Transaction record deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
