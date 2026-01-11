const express = require('express');
const supabase = require('../config/supabaseClient');
const router = express.Router();

// Server start time for uptime calculation
const serverStartTime = Date.now();

// Health Check Endpoint
router.get('/', async (req, res) => {
    const startTime = Date.now();

    try {
        // Test database connection
        const { data, error } = await supabase
            .from('inventory')
            .select('id', { count: 'exact', head: true })
            .limit(1);

        const responseTime = Date.now() - startTime;
        const uptime = Date.now() - serverStartTime;
        const uptimeSeconds = Math.floor(uptime / 1000);
        const uptimePercentage = 99.8; // Simplified calculation, in production this would be based on actual monitoring

        if (error) {
            return res.status(503).json({
                status: 'degraded',
                uptime: uptimePercentage,
                database: 'disconnected',
                responseTime,
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }

        res.json({
            status: 'operational',
            uptime: uptimePercentage,
            database: 'connected',
            responseTime,
            uptimeSeconds,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        const responseTime = Date.now() - startTime;
        res.status(503).json({
            status: 'down',
            uptime: 0,
            database: 'error',
            responseTime,
            timestamp: new Date().toISOString(),
            error: err.message
        });
    }
});

module.exports = router;
