require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fabricService = require('./services/fabricService');

const ngoRoutes = require('./routes/ngoRoutes');
const mrvRoutes = require('./routes/mrvRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/ngo', ngoRoutes);
app.use('/api/mrv', mrvRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Blue Carbon API is running' });
});

// Initialize Fabric connection
async function initializeFabric() {
    try {
        console.log('Enrolling admin user...');
        await fabricService.enrollAdmin();
        console.log('Admin enrolled successfully');
    } catch (error) {
        console.error('Failed to initialize Fabric:', error);
        process.exit(1);
    }
}

// Start server
async function startServer() {
    await initializeFabric();
    
    app.listen(PORT, () => {
        console.log(`🚀 Blue Carbon API Server running on port ${PORT}`);
        console.log(`📡 Health check: http://localhost:${PORT}/health`);
        console.log(`🌊 NGO API: http://localhost:${PORT}/api/ngo`);
        console.log(`📊 MRV API: http://localhost:${PORT}/api/mrv`);
    });
}

startServer();

module.exports = app;
