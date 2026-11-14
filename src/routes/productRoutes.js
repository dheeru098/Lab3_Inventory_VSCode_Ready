const express = require('express');
const controller = require('../controllers/productController');
const { validateProduct, validateStockAmount } = require('../middleware/validateProduct');

const router = express.Router();

router.post('/', validateProduct, controller.createProduct);
router.get('/', controller.getProducts);
router.get('/low-stock', controller.getLowStock);
router.get('/category-summary', controller.getCategorySummary);
router.get('/:id', controller.getProduct);
router.put('/:id', validateProduct, controller.updateProduct);
router.delete('/:id', controller.deleteProduct);
router.patch('/:id/restock', validateStockAmount, controller.restockProduct);
router.patch('/:id/sale', validateStockAmount, controller.sellProduct);

module.exports = router;
