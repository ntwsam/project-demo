const express = require('express');
const router = express.Router();

const Orders = require('../controllers/orders.controller');
const {authorize,protect} = require('../middleware/auth.middleware');

// 📌 เช็ค login
router.use(protect)

// 📌 สร้าง order
router.post('/createOrder', Orders.createOrders)

// 📌 ค้นหา order สำหรับลูกค้า
router.get('/buy',Orders.getAllBuyOrder)

// 📌 ค้นหา order สำหรับผู้ขาย
router.get('/sell',authorize('admin','seller'),Orders.getAllSellOrder)

// 📌 ค้นหา order สำหรับผู้ทำรายการ
router.get('/:id(\\d+)',Orders.getOrderById)

// 📌 อัพเดท order ( อนุญาติ admin , เจ้าของสินค้า เท่านั่น )
router.put('/:id(\\d+)',Orders.updateOrderStatus)

// 📌 ยกเลิก order
router.delete('/:id(\\d+)',Orders.cancelOrder)

module.exports = router