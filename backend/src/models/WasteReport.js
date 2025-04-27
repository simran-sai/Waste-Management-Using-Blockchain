const mongoose = require('mongoose');

const wasteReportSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    required: true,
    unique: true
  },
  reporter: {
    type: String,
    required: true,
    lowercase: true
  },
  location: {
    type: String,
    required: true
  },
  wasteType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['reported', 'collected'],
    default: 'reported'
  },
  collector: {
    type: String,
    lowercase: true
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  collectedAt: {
    type: Date
  },
  metadata: {
    type: Map,
    of: String
  }
});

module.exports = mongoose.model('WasteReport', wasteReportSchema);
