const rateLimiter = require('express-rate-limit')

// 📌 จำกัดการ login: 5 ครั้ง ต่อ 15 นาที
exports.loginLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 💡 15 นาที
    max: 5, // 💡 จำกัด 5 ครั้ง
    message: {message: '⚠️ Too many login attempts, please try again later'},
    standardHeaders: true,
    legacyHeaders: false,
});

// 📌 จำกัดทุก API Request: 100 ครั้ง ต่อ 1 ชั่วโมง
exports.apiLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000, // 💡 1 ชั่วโมง
    max: 100, // 💡 จำกัด 100 ครั้ง
    message: {message: '⚠️ Too many requests, please try again later'},
    standardHeaders: true,
    legacyHeaders: false,
});