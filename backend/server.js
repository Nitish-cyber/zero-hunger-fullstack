const express = require('express');
const cors = require('cors');
const path = require('path');
const authRouter = require('./routes/auth');
const transactionRouter = require('./routes/transactions');
const dbSim = require('./database_sim');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON Parsing Middlewares
app.use(cors());
app.use(express.json());

// Set up routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRouter);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });
} else {
    // Fallback status page
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: "Zero Hunger Platform Backend Server API operational.",
            databaseUsers: dbSim.getUsers().length,
            activeDonations: dbSim.getDonations().length
        });
    });
}

// Start listening
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`ZERO HUNGER API SERVER RUNNING ON http://localhost:${PORT}`);
    console.log(`Pre-seeded with 5 dynamic user profiles (Donor, NGO, Volunteer, Vendor, Admin)`);
    console.log(`Pre-seeded with 3 active food catalog listings`);
    console.log(`======================================================\n`);
    dbSim.logSystemEvent(`API server successfully listening on port ${PORT}.`);
});
