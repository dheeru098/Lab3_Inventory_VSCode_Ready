const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must have at least 2 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    trim: true,
    uppercase: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    default: 0,
    min: [0, 'Quantity cannot be negative'],
    validate: {
      validator: Number.isSafeInteger,
      message: 'Quantity must be a whole number'
    }
  },
  reorderLevel: {
    type: Number,
    default: 5,
    min: [0, 'Reorder level cannot be negative'],
    validate: {
      validator: Number.isSafeInteger,
      message: 'Reorder level must be a whole number'
    }
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('stockValue').get(function () {
  return Math.round(this.price * this.quantity * 100) / 100;
});

module.exports = mongoose.model('Product', productSchema);
