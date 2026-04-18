const { Product } = require('../models/Product');
const { Category } = require('../models/Category');
const { Transaction } = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc   Add a new product
// @route  POST /api/v1/products
// @access Public
exports.createProduct = async (req, res) => {
  try {
    const { name, description, image, quantity, categoryId } = req.body;
    const imageUrl = req.file ? req.file.path : image;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID format' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const product = await Product.create({
      name,
      description,
      image: imageUrl,
      quantity,
      category: categoryId
    });

    await Category.findByIdAndUpdate(categoryId, { $push: { products: product._id } });

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error while adding product', error: error.message });
  }
};

// @desc   Get all products
// @route  GET /api/v1/products
// @access Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// @desc   Search products by name
// @route  GET /api/v1/products/search?name=xxx
// @access Public
exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.name || '';
    const products = await Product.find({ name: new RegExp(query, 'i') });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
};

// @desc   Get single product by ID
// @route  GET /api/v1/products/:id
// @access Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// @desc   Update product
// @route  PUT /api/v1/products/:id
// @access Public
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, image, quantity, category } = req.body;
    const imageUrl = req.file ? req.file.path : image;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, image: imageUrl, quantity, category },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// @desc   Delete product
// @route  DELETE /api/v1/products/:id
// @access Public
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// @desc   Modify product quantity (add or subtract)
// @route  PATCH /api/v1/products/:id/quantity
// @access Public
exports.updateProductQuantity = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { quantity, operation, unit = 1 } = req.body;

    if (!['add', 'subtract'].includes(operation)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        error: 'Invalid operation. Use "add" or "subtract".' 
      });
    }

    const product = await Product.findById(req.params.id).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Product not found' });
    }

    const change = Number(quantity) * Number(unit);
    
    if (operation === 'subtract' && product.quantity < change) {
      await session.abortTransaction();
      return res.status(400).json({ 
        error: 'Insufficient quantity available' 
      });
    }

    product.quantity = operation === 'add'
      ? product.quantity + change
      : product.quantity - change;

    await product.save({ session });

    // Create a transaction record
    await Transaction.create([{
      product: product._id,
      quantity,
      unit,
      operation: operation === 'add' ? 'Receive' : 'Distribute',
      purpose: 'Manual quantity adjustment'
    }], { session });

    await session.commitTransaction();
    res.status(200).json({ 
      success: true,
      message: `Product quantity ${operation}ed successfully.`, 
      data: {
        product,
        transaction: transaction[0]
      }
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(500).json({ 
      error: 'Error updating quantity', 
      details: error.message 
    });
  } finally {
    session.endSession();
  }
};

// Helper functions for transaction processing
exports.addProductQuantity = async (productId, quantity, unit = 1) => {
  await Product.findByIdAndUpdate(
    productId,
    { $inc: { quantity: quantity * unit } }
  );
};

exports.subtractProductQuantity = async (productId, quantity, unit = 1) => {
  await Product.findByIdAndUpdate(
    productId,
    { $inc: { quantity: -quantity * unit } }
  );
};
