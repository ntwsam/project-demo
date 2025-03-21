const Users = require('../models/users.model')

// 📌 ดึงข้อมูลจาก database
exports.protect = async (req, res, next) => {
    try {
        // ตรวจสอบว่ามี session และ userId ใน session หรือไม่
        if (req.session && req.session.userId) {
            // ดึงข้อมูลผู้ใช้จาก database
            const user = await Users.findByPk(req.session.userId)
            if (user) {
                req.user = user
                next()
            } else {
                return res.status(401).json({message: '⚠️ Not authorized, invalid user'});
            }
        } else{
            return res.status(401).json({ message: '⚠️ Not authorized, no token' });
            }
    } catch (err) {
        next(err);
    }
}

// 📌 กำหนดสิทธิ์การเข้าถึงตาม Role
exports.authorize = (roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: '⚠️ Unauthorized: User not authenticated' });
    }
    if (!req.user.role) {
        return res.status(403).json({ message: '⚠️ Unauthorized: User role not defined' });
    }
    if (!roles.includes(req.user.role.toLowerCase())) {
        return res.status(403).json({ message: '⚠️ Unauthorized: Insufficient privileges' });
    }

    next();
};