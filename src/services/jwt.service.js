const jwt = require('jsonwebtoken')

// 📌 สร้าง access token
exports.generateAccessToken = (user) => {
    return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

// 📌 สร้าง refresh token
exports.generateRefreshToken = (user) => {
    return jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}