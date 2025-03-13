const pool = require('../config/mysql.config')

// 📌 ดึงข้อมูลจาก database
exports.getUserFromSession = async (req, res, next) => {
    if (req.session.passport && req.session.passport.user) {
        try {
            const [rows] = await pool.promise().query('SELECT * FROM users WHERE id = ?', [req.session.passport.user]);
            req.user = rows[0];
        } catch (err) {
            next(err);
        }
    }
    next();
}

// 📌 กำหนดสิทธิ์การเข้าถึงตาม Role
exports.authorize = (roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({message: "Unauthorized - No user found"});
    }

    if (!roles.includes(req.user.role.toLowerCase())) {
        return res.status(403).json({message: "Unauthorized - Forbidden"});
    }

    next();
};