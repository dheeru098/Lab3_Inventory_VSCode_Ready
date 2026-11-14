const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readPositiveInteger(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function readPrice(value) {
  if (value === undefined) {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

exports.getProducts = asyncHandler(async (req, res) => {
  const page = readPositiveInteger(req.query.page, 1);
  const limit = readPositiveInteger(req.query.limit, 10);
  const allowedSorts = [
    'name', '-name', 'price', '-price', 'quantity', '-quantity',
    'category', '-category', 'createdAt', '-createdAt', 'sku', '-sku'
  ];
  const sort = req.query.sort || '-createdAt';

  if (!page || !limit || limit > 100) {
    return res.status(400).json({ message: 'Page and limit must be positive whole numbers, and limit cannot exceed 100' });
  }

  if (typeof sort !== 'string' || !allowedSorts.includes(sort)) {
    return res.status(400).json({ message: 'Invalid sort field' });
  }

  const filter = {};

  if (req.query.category !== undefined) {
    if (typeof req.query.category !== 'string' || !req.query.category.trim()) {
      return res.status(400).json({ message: 'Category must be a non-empty string' });
    }

    filter.category = new RegExp(`^${escapeRegex(req.query.category.trim())}$`, 'i');
  }

  if (req.query.search !== undefined) {
    if (typeof req.query.search !== 'string' || !req.query.search.trim()) {
      return res.status(400).json({ message: 'Search must be a non-empty string' });
    }

    const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [
      { name: search },
      { sku: search },
      { category: search },
      { supplier: search }
    ];
  }

  const minPrice = readPrice(req.query.minPrice);
  const maxPrice = readPrice(req.query.maxPrice);

  if (minPrice === null || maxPrice === null || (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)) {
    return res.status(400).json({ message: 'Price range is not valid' });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = maxPrice;
    }
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    total,
    page,
    totalPages: Math.ceil(total / limit),
    count: products.length,
    products
  });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json({ message: 'Product deleted', id: product.id });
});

exports.restockProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { quantity: req.body.amount } },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

exports.sellProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, quantity: { $gte: req.body.amount } },
    { $inc: { quantity: -req.body.amount } },
    { new: true }
  );

  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    return res.status(exists ? 409 : 404).json({
      message: exists ? 'Not enough stock available' : 'Product not found'
    });
  }

  res.json(product);
});

exports.getLowStock = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.find({
    $expr: { $lte: ['$quantity', '$reorderLevel'] }
  }).sort({ quantity: 1, name: 1 });

  res.json({ count: lowStockItems.length, lowStockItems });
});

exports.getCategorySummary = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        lowStockProducts: {
          $sum: { $cond: [{ $lte: ['$quantity', '$reorderLevel'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        productCount: 1,
        totalQuantity: 1,
        totalStockValue: { $round: ['$totalStockValue', 2] },
        lowStockProducts: 1
      }
    },
    { $sort: { category: 1 } }
  ]);

  res.json({ count: categories.length, categories });
});
