require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./src/routes/productRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Inventory Management API is running' });
});

app.use('/api/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

if (!mongoUri) {
  console.error('MONGODB_URI is missing from the .env file');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(async () => {
    const Product = require('./src/models/Product');
    await Product.init();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log('MongoDB connected');
    });
  })
  .catch(error => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
