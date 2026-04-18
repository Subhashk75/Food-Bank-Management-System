const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  searchProducts,
  updateProduct,
  deleteProduct,
  updateProductQuantity
} = require('../controllers/productController');

const { upload } = require('../utils/cloudinary');

const { authMiddleware, authorizeRoles } = require('../utils/auth');

// ✅ Create product (admin only)
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin','staff'),
  upload.single('image'),
  createProduct
);

// ✅ Get all products (admin, staff, volunteer)
router.get(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'staff', 'volunteer'),
  getAllProducts
);

// ✅ Search products (admin, staff, volunteer)
router.get(
  '/search',
  authMiddleware,
  authorizeRoles('admin', 'staff', 'volunteer'),
  searchProducts
);

// ✅ Get product by ID (admin, staff, volunteer)
router.get(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'staff', 'volunteer'),
  getProductById
);

// ✅ Update product (admin only)
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  upload.single('image'),
  updateProduct
);

// ✅ Delete product (admin only)
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin','staff'),
  deleteProduct
);

// ✅ Update product quantity (admin, staff)
router.patch(
  '/:id/quantity',
  authMiddleware,
  authorizeRoles('admin', 'staff'),
  updateProductQuantity
);

module.exports = router;
