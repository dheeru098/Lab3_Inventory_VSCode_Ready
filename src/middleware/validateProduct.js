const productFields = new Set([
  'name',
  'sku',
  'category',
  'price',
  'quantity',
  'reorderLevel',
  'supplier'
]);

function validateProduct(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ message: 'Request body must be a JSON object' });
  }

  const fields = Object.keys(req.body);

  if (fields.length === 0) {
    return res.status(400).json({ message: 'At least one product field is required' });
  }

  const unknown = fields.filter(field => !productFields.has(field));

  if (unknown.length > 0) {
    return res.status(400).json({ message: `Unknown fields: ${unknown.join(', ')}` });
  }

  next();
}

function validateStockAmount(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ message: 'Request body must be a JSON object' });
  }

  if (Object.keys(req.body).length !== 1 || !Number.isSafeInteger(req.body.amount) || req.body.amount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive whole number' });
  }

  next();
}

module.exports = { validateProduct, validateStockAmount };
