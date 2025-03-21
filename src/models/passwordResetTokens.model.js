const mongoose = require('mongoose')

const PasswordResetTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
})

// 📌 ลบอัตโนมัติเมื่อหมดเวลา
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const PasswordResetToken = mongoose.model('PasswordResetToken', PasswordResetTokenSchema)

module.exports = PasswordResetToken;