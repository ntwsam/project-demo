const express = require('express')
const router = express.Router()

const Product = require('../controllers/products.controller')
const { authorize, protect } = require('../middleware/auth.middleware')

// 📌 เช็ค login
router.use(protect)

// 📌 สร้างสินค้า
router.post('/', authorize('seller'), Product.createProduct)

// 📌 เช็คสินค้า
router.get('/', authorize('admin'), Product.getAllProducts)

// 📌 เช็คสินค้าด้วย id
router.get('/:id(\\d+)', authorize('admin'), Product.getProductById)

// 📌 ต้นหาสินค้า
router.get('/search',Product.searchProducts)

// 📌 อัพเดทสินค้าด้วย id
router.put('/:id(\\d+)', authorize('admin', 'seller'), Product.updateProduct)

// 📌 ลบสินค้าด้วย id (admin หรือ owner)
router.delete('/:id(\\d+)', authorize('admin', 'seller'), Product.deleteProduct)

// 📌  เช็คสินค้าของตัวเอง
router.get('/my-products', authorize('seller'), Product.getMyProducts);

module.exports = router