const { Products } = require('../models/products.model')
const { Users } = require('../models/users.model')
const { createProduct, updateProduct } = require('../utils/productSchema')
const {Op} = require("sequelize");

// 📌 helper ช่วยเช็คสิทธิ์
const checkProductAuthorization = async (req, product, res) => {
    const userId = req.session.id
    const user = await Users.findOne({ where: { id: userId } })
    if (user.role !== 'admin' && product.ownerId !== user.uuid) {
        return res.status(403).json({ message: '⚠️ You are not authorized to perform this action' });
    }
    return null
}

// 📌 สร้างสินค้า ( อนุญาติ seller เท่านั่น )
exports.createProduct = async (req, res, next) => {
    try {
        // 💡 ตรวจสอบ req.body
        const { err, value } = createProduct.validate(req.body)
        if (err) {
            return res.status(400).json({ message: err.details[0].message });
        }
        const { name, description, category, price, stock } = value
        // 💡 ตรวจสอบ user ที่ login
        const userId = req.session.id
        const user = await Users.findOne({ where: { id: userId } })
        // 💡 ตรวจสอบ product ว่ามีหรือยัง
        const existingName = await Products.findOne({
            where: {
                name,
                ownerId: user.uuid
            }
        })
        if (existingName) {
            return res.status(400).json({ message: '⚠️ You already created this product' });
        }
        const product = await Products.create({
            name,
            description,
            category,
            price: parseFloat(price),
            stock,
            ownerId: user.uuid,
        })
        res.status(200).json({
            message: '🎉 Product created successfully!',
            product: {
                name: product.name,
                id: product.id,
                description: product.description,
                category: product.category,
                price: product.price,
                stock: product.stock,
                owner: product.ownerId,
            }
        })
    } catch (err) {
        next(err)
    }
}

// 📌 ดึงข้อมูลสินค้าทั้งหมด ( อนุญาติ admin เท่านั่น )
exports.getAllProducts = async (req, res, next) => {
    try {
        const products = await Products.findAll()
        res.status(200).json(products)
    } catch (err) {
        next(err)
    }
}

// 📌 ดึงข้อมูลสินค้าตาม id ( อนุญาติ admin เท่านั่น )
exports.getProductById = async (req, res, next) => {
    try {
        const product = await Products.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: '⚠️ Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
};

// 📌 ค้นหาสินค้า
exports.searchProducts = async (req, res, next) => {
    const name = req.query.name
    const category = req.query.category
    const price = req.query.price
    if (!name && !category && !price) {
        return res.status(400).json({message: '⚠️ Please provide a product'})
    }
    const where = {}
    if (name) {
        where.name = {[Op.like]: `%${name}%`};
    }
    if (category) {
        where.category = {[Op.like]: `%${category}%`};
    }
    if (price) {
        where.price = {[Op.like]: `%${price}%`};
    }
    try{
        const products = await Products.findAll({
            where: where,
            include: {
                model: Users,
                as: 'User',
                attributes: ['uuid','email']
            }
        })
        if (!products.length) {
            return res.status(404).json({message: '⚠️ Product not found'})
        }
        const result = products.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            stock: product.stock,
            owner: product.ownerId,
        }));
        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

// 📌 อัพเดทสินค้า ( อนุญาติเจ้าของ กับ admin เท่านั่น )
exports.updateProduct = async (req, res, next) => {
    try {
        const { err, value } = updateProduct.validate(req.body)
        if (err) {
            return res.status(400).json({ message: err.details[0].message });
        }
        // 💡 ตรวจสอบ สินค้า
        const product = await Products.findOne({ where: { id: req.params.id } })
        if (!product) {
            return res.status(404).json({ message: '⚠️ Product not found' });
        }
        // 💡 ตรวจสอบสิทธิ์
        const authorization = await checkProductAuthorization(req, product, res);
        if (authorization) {
            return authorization
        }
        Object.assign(product, value)
        await product.save()

        res.status(200).json({ message: '🎉 Your product updated successfully!', product: product });
    } catch (err) {
        next(err);
    }
}

// 📌 ลบสินค้า ( อนุญาติเจ้าของ กับ admin เท่านั่น )
exports.deleteProduct = async (req, res, next) => {
    try {
        // 💡 ตรวจสอบ สินค้า
        const product = await Products.findOne({ where: { id: req.params.id } })
        if (!product) {
            return res.status(404).json({ message: '⚠️ Product not found' });
        }
        // 💡 ตรวจสอบสิทธิ์
        const authorization = await checkProductAuthorization(req, product, res);
        if (authorization) {
            return authorization
        }
        const deleted = await Products.destroy({ where: { id: product.id } })
        if (deleted) {
            return res.status(200).json({ message: '🎉 Product deleted successfully!' });
        }
    } catch (err) {
        next(err);
    }
}

// 📌 ตรวจสอบสินค้าของตนเอง
exports.getMyProducts = async (req, res, next) => {
    try {
        // 💡 ตรวจสอบ user ที่ login
        const userId = req.session.id
        const user = await Users.findOne({ where: { id: userId } })
        // 💡 ดึงสินค้าจาก ownerId
        const products = await Products.findAll({
            where: { ownerId: user.uuid }
        })
        res.status(200).json(products)
    } catch (err) {
        next(err);
    }
}