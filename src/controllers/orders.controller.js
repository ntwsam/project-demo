const { Orders } = require('../models/orders.model')
const { OrderDetails } = require('../models/orderDetails.model')
const { Users } = require('../models/users.model')
const { Products } = require('../models/products.model')
const { createOrder, updateStatus } = require('../utils/orderSchema')
const { Sequelize } = require("../config/sequelize");

// 📌 helper ช่วยเช็คสิทธิ์
const checkOrderAuthorization = async (user, orderId, order) => {
    if (user.role !== 'admin') {
        if (user.role === 'seller') {
            const products = await Products.findAll({ where: { ownerId: user.uuid } });
            const productIds = products.map((product) => product.id);
            const orderDetails = await OrderDetails.findAll({ where: { productId: productIds, orderId: orderId } });
            if (orderDetails.length === 0 && order.customerId !== user.uuid) {
                return false;
            }
        } else if (user.role === 'customer') {
            if (order.customerId !== user.uuid) {
                return false;
            }
        } else {
            return false;
        }
    }
    return true;
}

// 📌 helper ช่วยเช็ค order และ สิทธิ์
const getOrderAndCheckAuthorization = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const order = await Orders.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: '⚠️ Order not found' });
        }
        const user = await Users.findOne({ where: { id: req.session.userId } });
        if (!await checkOrderAuthorization(user, orderId, order)) {
            return res.status(403).json({ message: '⚠️ You are not authorized to perform this action' });
        }
        return { order, user };
    } catch (err) {
        next(err);
    }
};

// 📌 สร้าง order
exports.createOrders = async (req, res, next) => {
    const transaction = await Sequelize.transaction() // 💡 เพิ่มเพื่อให้ข้อมูลสอดคล้องกัน
    try {
        const { err, value } = createOrder.validate(req.body)
        if (err) {
            return res.status(400).json({ message: err.details[0].message })
        }
        const { productId, quantity, paymentMethod } = value
        // 💡 ตรวจสอบ login
        const user = await Users.findOne({ where: { id: req.session.userId } })
        const product = await Products.findOne({ where: { id: productId } })
        // 💡 ตรวจสอบสินค้า
        if (!product) {
            return res.status(404).json({ message: '⚠️ Product not found' })
        }
        // 💡 เช็คว่าสินค้ามีจำนวนพอมั้ย
        if (quantity > product.stock) {
            return res.status(500).json({ message: '⚠️ Product not enough' })
        }
        const owner = product.ownerId
        // 💡 เช็คว่าสินค้าเป็นของตนเองรึป่าว
        if (user.uuid === owner) {
            return res.status(500).json({ message: '⚠️ You can not buy own product' })
        }
        const order = await Orders.create({
            customerId: user.uuid,
            status: 'Pending payment',
            orderAt: new Date(),
            paymentMethod,
            paymentStatus: 'Processing',
        }, { transaction })
        // 💡 คำนวนราคา
        const price = quantity * product.price
        const orderDetail = await OrderDetails.create({
            orderId: order.id,
            productId: product.id,
            quantity,
            price: parseFloat(price),
        }, { transaction })
        await transaction.commit()
        res.status(200).json({
            message: '🎉 Product created successfully!',
            order: {
                id: order.id,
                customerId: order.customerId,
                status: order.status,
                orderAt: order.orderAt,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
            },
            orderDetail: {
                orderId: orderDetail.orderId,
                productId: orderDetail.productId,
                quantity: orderDetail.quantity,
                price: orderDetail.price,
            }
        })
    } catch (err) {
        await transaction.rollback()
        next(err)
    }
}

// 📌 ต้นหา order ทั้งหมด ( ลูกค้า )
exports.getAllBuyOrder = async (req, res, next) => {
    try {
        const user = await Users.findOne({ where: { id: req.session.userId } })
        const orders = await Orders.findAll({ where: { customerId: user.uuid } })
        res.status(200).json(orders)
    } catch (err) {
        next(err)
    }
}

// 📌 ต้นหา order ทั้งหมด ( ลูกค้า )
exports.getAllSellOrder = async (req, res, next) => {
    try {
        const user = await Users.findOne({ where: { id: req.session.userId } })
        const products = await Products.findAll({ where: { ownerId: user.uuid } })
        const productIds = products.map((product) => product.id)
        const orderDetails = await OrderDetails.findAll({ where: { productId: productIds } })
        const orderIds = orderDetails.map((detail) => detail.orderId)
        const orders = await Orders.findAll({ where: { id: orderIds } })
        res.status(200).json(orders)
    } catch (err) {
        next(err)
    }
}

// 📌 ต้นหา order ด้วย id ( อนุญาติ admin , เจ้าของสินค้าและผู้ทำรายการ เท่านั่น )
exports.getOrderById = async (req, res, next) => {
    try {
        const { order } = await getOrderAndCheckAuthorization(req, res, next)
        if (res.headersSent) return // 💡 ป้องกันการส่ง response ซ้ำซ้อน
        res.status(200).json(order)
    } catch (err) {
        next(err);
    }
}

// 📌 อัพเดท order ด้วย id ( อนุญาติ admin , เจ้าของสินค้า เท่านั่น )
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { order, user } = await getOrderAndCheckAuthorization(req, res, next);
        if (res.headersSent) return // 💡 ป้องกันการส่ง response ซ้ำซ้อน
        const { err, value } = updateStatus.validate(req.body);
        if (err) return next(err)
        const { status } = value
        if (user.role === 'customer') {
            return res.status(403).json({ message: '⚠️ You are not authorized to perform this action' })
        }
        await Orders.update({ status }, { where: { id: order.id } })
        res.status(200).json({ message: '🎉 Order status updated successfully!' })
    } catch (err) {
        next(err);
    }
};

// 📌 ยกเลิก order ด้วย id ( อนุญาติ admin , เจ้าของสินค้าและผู้ทำรายการ เท่านั่น )
exports.cancelOrder = async (req, res, next) => {
    try {
        const { order } = await getOrderAndCheckAuthorization(req, res, next)
        if (res.headersSent) return // 💡 ป้องกันการส่ง response ซ้ำซ้อน
        await Orders.update({ status: 'Cancelled' }, { where: { id: order.id } })
        res.status(200).json({ message: ' Order cancelled successfully!' })
    } catch (err) {
        next(err);
    }
};