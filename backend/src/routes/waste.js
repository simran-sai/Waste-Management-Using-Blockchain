const express = require('express');
const router = express.Router();
const WasteReport = require('../models/WasteReport');
const blockchainService = require('../services/blockchain');

// Get all waste reports
router.get('/', async (req, res) => {
    try {
        const reports = await WasteReport.find().sort({ reportedAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get waste reports by user address
router.get('/user/:address', async (req, res) => {
    try {
        const reports = await WasteReport.find({ reporter: req.params.address.toLowerCase() });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new waste report
router.post('/', async (req, res) => {
    try {
        const { blockchainId, reporter, location, wasteType } = req.body;
        
        const report = new WasteReport({
            blockchainId,
            reporter: reporter.toLowerCase(),
            location,
            wasteType
        });

        const newReport = await report.save();
        res.status(201).json(newReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update waste report status
router.patch('/:id', async (req, res) => {
    try {
        const report = await WasteReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (req.body.status === 'collected') {
            report.status = 'collected';
            report.collector = req.body.collector.toLowerCase();
            report.collectedAt = new Date();
        }

        const updatedReport = await report.save();
        res.json(updatedReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
