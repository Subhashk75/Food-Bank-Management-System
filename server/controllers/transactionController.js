const mongoose = require('mongoose');
const { Transaction } = require('../models/Transaction');
const {Product} = require("../models/Product")

// @desc    Get all transactions
// @route   GET /api/v1/transactions
const getAllTransactions = async (req, res) => {
  try {
   const transactions = await Transaction.find()
          .populate('product', 'name')
          .sort({ createdAt: -1 });

     
      console.log(transactions);
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions',
      error: err.message
    });
  }
};


// @desc    Get transaction by ID
// @route   GET /api/v1/transactions/:id
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('product', 'name quantity unit');
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: transaction 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching transaction',
      error: err.message 
    });
  }
};

// @desc    Create new transaction (Distribute or Receive)
// @route   POST /api/v1/transactions
const createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { product, quantity, unit, operation, purpose, batchSize, items, distributedTo } = req.body;

    // Backward compatibility: If single product format, convert to items array
    if (product && quantity && (!items || items.length === 0)) {
      items = [{ productId: product, name: 'Legacy Product', quantity }];
      distributedTo = purpose;
    }

    if (!operation || !['Distribute', 'Receive'].includes(operation)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Invalid or missing operation type' });
    }

    if (!items || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'No items provided for transaction' });
    }

    const transactionItems = [];
    const unitMap = { pcs: 1, kg: 1, g: 0.001, l: 1, ml: 0.001, box: 10, pack: 5 };
    const multiplier = unitMap[unit] || 1;

    // Step 1: Validation and Data Preparation
    for (const item of items) {
      const productDoc = await Product.findById(item.productId).session(session);
      if (!productDoc) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const quantityInBase = Number(item.quantity) * multiplier;

      // Check for sufficient stock only in distribution
      if (operation === 'Distribute' && productDoc.quantity < quantityInBase) {
        throw new Error(`Insufficient stock for ${productDoc.name}. Available: ${productDoc.quantity}, Needed: ${quantityInBase}`);
      }

      transactionItems.push({
        productId: productDoc._id,
        name: productDoc.name,
        quantity: item.quantity,
        baseQuantity: quantityInBase // tracking for internal use if needed
      });
    }

    // Step 2: Atomic Inventory Update
    for (const tItem of transactionItems) {
      const quantityChange = operation === 'Distribute' ? -tItem.baseQuantity : tItem.baseQuantity;
      await Product.findByIdAndUpdate(
        tItem.productId,
        { $inc: { quantity: quantityChange } },
        { session }
      );
    }

    // Step 3: Create Transaction Record
    const transaction = await Transaction.create([{
      product: transactionItems.length === 1 ? transactionItems[0].productId : null, // legacy field
      quantity: transactionItems.length === 1 ? transactionItems[0].quantity : null, // legacy field
      unit,
      operation,
      purpose: distributedTo || purpose, // legacy field
      batchSize: batchSize || null,
      items: transactionItems.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity })),
      distributedTo: distributedTo || purpose,
      distributedBy: req.user ? req.user.id : null,
      status: 'completed'
    }], { session });

    await session.commitTransaction();
    return res.status(201).json({ success: true, data: transaction[0] });

  } catch (err) {
    await session.abortTransaction();
    console.error("Transaction Error:", err);
    return res.status(500).json({ success: false, message: err.message || 'Transaction creation failed' });
  } finally {
    session.endSession();
  }
};



// @desc    Update a transaction
// @route   PUT /api/v1/transactions/:id
const updateTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const transaction = await Transaction.findById(req.params.id).session(session);
    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    // Prevent updating completed transactions
    if (transaction.status === 'completed') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Completed transactions cannot be modified'
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, session }
    ).populate('product', 'name quantity unit');

    await session.commitTransaction();
    res.status(200).json({ 
      success: true, 
      data: updatedTransaction 
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ 
      success: false, 
      message: 'Error updating transaction',
      error: err.message 
    });
  } finally {
    session.endSession();
  }
};

// @desc    Restore product quantities from transactions
// @route   POST /api/v1/transactions/restore
const restoreTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Reset all product quantities to 0
      await Product.updateMany({}, { $set: { quantity: 0 } }, { session });

      // Process all completed transactions in chronological order
      const transactions = await Transaction.find({ status: 'completed' })
        .sort({ createdAt: 1 })
        .session(session);

      for (const transaction of transactions) {
        const { product, quantity, unit, operation } = transaction;
        
        const quantityChange = operation === 'Receive' 
          ? quantity * unit 
          : -quantity * unit;

        await Product.findByIdAndUpdate(
          product,
          { $inc: { quantity: quantityChange } },
          { session }
        );
      }
    });

    res.status(200).json({
      success: true,
      message: 'Product quantities restored from transactions',
      transactionsProcessed: transactions.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to restore product quantities',
      error: err.message 
    });
  } finally {
    session.endSession();
  }
};
module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  restoreTransaction
};