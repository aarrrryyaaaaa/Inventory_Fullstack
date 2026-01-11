const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/reports', require('./routes/exportRoutes'));


app.get('/', (req, res) => {
    res.send('Inventory API is running...');
});

// Start server only if this file is run directly (not required as a module)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;

