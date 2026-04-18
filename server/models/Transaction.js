const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false // Changed to optional for multi-item distributions
  },
  quantity: {
    type: Number,
    required: false, // Changed to optional for multi-item distributions
    min: 1
  },
  unit: {
    type: String,
    required: true,
    min: 1
  },
  purpose: {
    type: String,
    required: false // Replaced by distributedTo in new format, kept for compatibility
  },
  batchSize: {
    type: String,
    required: false
  },
  // New fields for multi-product distribution
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantity: Number
    }
  ],
  distributedTo: {
    type: String,
    required: false
  },
  distributedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  operation: {
    type: String,
    enum: ['Receive', 'Distribute'],
    default: 'Distribute'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction };