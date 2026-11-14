module.exports = function errorHandler(error, req, res, next) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map(item => item.message);
    return res.status(400).json({ message: 'Validation failed', errors: details });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid product ID or field value' });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'A product with this SKU already exists' });
  }

  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
};
