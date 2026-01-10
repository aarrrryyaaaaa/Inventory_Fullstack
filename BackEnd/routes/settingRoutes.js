const express = require('express');
const supabase = require('../config/supabaseClient');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

// GET current dashboard note
router.get('/note', verifyToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'dashboard_note')
            .single();

        if (error) {
            // If not found, return default
            return res.json({ value: 'Welcome to ATS Inventory System!' });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update dashboard note (Admin Only)
router.patch('/note', verifyToken, checkRole('admin'), async (req, res) => {
    const { value } = req.body;
    try {
        const { data, error } = await supabase
            .from('settings')
            .upsert({ key: 'dashboard_note', value, updated_at: new Date() })
            .select();

        if (error) throw error;
        res.json({ message: 'Note updated successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
