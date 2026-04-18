const mongoose = require('mongoose');
const { Inventory } = require('../models/Inventory');
const { Product } = require('../models/Product');
const { Transaction } = require('../models/Transaction');

/**
 * @desc    Get all inventory records (populated)
 * @route   GET /api/v1/inventory
 */
const getInventory = async (req, res) => {
  try {
    const records = await Inventory.find()
      .populate('productId')
      .populate('receivedBy')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

/**
 * @desc    Create a single inventory record and update product quantity + transaction
 * @route   POST /api/v1/inventory
 */
const createInventoryItem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, quantity, unit, purpose, batchSize } = req.body;
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Step 1: Validate input
    if (!productId || !quantity || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'productId, quantity, and purpose are required.'
      });
    }

    // Step 2: Check product existence
    const product = await Product.findById(productId).session(session);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Step 3: Update product quantity
    product.quantity += Number(quantity);
    await product.save({ session });

    // Step 4: Create Inventory Record
    const newInventory = await Inventory.create([{
      productId: product._id,
      name: product.name,
      quantity,
      unit: unit || 'pcs',
      purpose,
      batchSize,
      receivedBy: userId
    }], { session });

    // Step 5: Create Transaction Record (Fix field names)
    const transaction = await Transaction.create([{
      product: product._id,                   // use `product` (ref) instead of full object
      quantity,                               // use plain quantity
      unit: unit || 'pcs',
      purpose,
      batchSize,
      operation:'Receive',                              // ✅ renamed from batch → batchSize
      createdBy: userId
    }], { session });

    // Step 6: Commit
    await session.commitTransaction();

    // Step 7: Respond
    res.status(201).json({
      success: true,
      data: {
        inventory: newInventory[0],
        transaction: transaction[0],
        product
      }
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error('Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory item',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};


/**
 * @desc    Receive and record multiple inventory items in bulk
 * @route   POST /api/v1/inventory/receive
 */
const receiveInventory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { products, unit, purpose, batchSize } = req.body;
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Products array is required' });
    }

    if (!purpose) {
      return res.status(400).json({ success: false, message: 'Purpose is required' });
    }

    const inventoryRecords = [];
    const processedProducts = [];

    for (const product of products) {
      const { _id, quantity, unit: itemUnit } = product;
      if (!_id || !quantity) {
        throw new Error(`Invalid product data: ${JSON.stringify(product)}`);
      }

      const dbProduct = await Product.findById(_id).session(session);
      if (!dbProduct) throw new Error(`Product not found: ${_id}`);

      const quantityToAdd = quantity;

      // Update product quantity
      dbProduct.quantity += quantityToAdd;
      await dbProduct.save({ session });

      // Save inventory record
      const record = await Inventory.create([{
        productId: dbProduct._id,
        name: dbProduct.name,
        quantity: quantityToAdd,
        unit: itemUnit || 'pcs',
        purpose,
        batchSize,
        receivedBy: userId
      }], { session });

      inventoryRecords.push(record[0]);

      processedProducts.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        quantityAdded: quantityToAdd,
        unit: itemUnit || 'pcs',
        newQuantity: dbProduct.quantity
      });
    }

    // Save transaction record
    const transaction = await Transaction.create([{
      type: 'receipt',
      products: processedProducts,
      purpose,
      batch: batchSize,
      unit: unit || 'pcs',
      createdBy: userId
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        transaction: transaction[0],
        inventory: inventoryRecords,
        products: processedProducts
      }
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Receive inventory failed:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to receive inventory',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getInventory,
  createInventoryItem,
  receiveInventory
};
