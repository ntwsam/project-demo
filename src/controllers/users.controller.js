const escapeHtml = require('escape-html') // 💡 ไว้ป้องกัน XSS attacks
const bcrypt = require('bcryptjs');
const { v4: uuidV4 } = require('uuid');

const { Users } = require('../models/users.model')
const PasswordResetTokens = require('../models/passwordResetTokens.model');
const { changePassword, updateSchema, emailVerify, resetPassword } = require('../utils/registerSchema')
const sendEmail = require('../utils/sendEmail')

// 📌 ดูรายชื่อผู้ใช้งานทั้งหมด ( อนุญาติ admin เท่านั่น )
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await Users.findAll()
        res.status(200).json(users)
    } catch (err) {
        next(err)
    }
}

// 📌 ดูรายชื่อผู้ใช้งานผ่าน id ( อนุญาติ admin เท่านั่น )
exports.getUserById = async (req, res, next) => {
    try {
        const user = await Users.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: '⚠️ User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

// 📌 อัพเดทผู้ใช้งานตาม id ( อนุญาติ admin เท่านั่น )
exports.updateUser = async (req, res, next) => {
    try {
        const { err, value } = updateSchema.validate(req.body);
        if (err) {
            return res.status(400).json({ message: err.details[0].message });
        }
        const user = await Users.findByPk(req.params.id)
        if (!user) {
            return res.status(404).json({ message: '⚠️ User not found' });
        }
        if (req.body.username) {
            user.username = escapeHtml(req.body.username)
        }
        if (req.body.role) {
            // 💡 ตรวจสอบว่า admin ไม่ได้เปลี่ยน role ตัวเอง
            if (req.params.id === req.session.userId && req.body.role !== user.role) {
                return res.status(403).json({ message: '⚠️ Admin cannot change their own role' });
            }
            // ตรวจสอบว่าผู้ใช้ทั่วไปไม่ได้เปลี่ยน role เป็น admin
            if (req.body.role === 'admin' && req.user && req.user.role !== 'admin') {
                return res.status(403).json({ message: '⚠️ Only admins can set role to admin' });
            }
            user.role = req.body.role;
        }

        Object.assign(user, value) // 💡 อัปเดตข้อมูลเฉพาะที่มีใน req.body
        await user.save() // 💡 ใช้ user.save() เพื่ออัปเดตข้อมูล

        res.status(200).json({ message: '🎉 User updated successfully!', user: user });
    } catch (err) {
        next(err);
    }
};

// 📌 ลบผู้ใช้งาน ( อนุญาติ admin เท่านั่น )
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await Users.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: '⚠️ User not found' });
        }
        await Users.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: '🎉 User deleted successfully!' });
    } catch (err) {
        next(err);
    }
};

// 📌 ดูโปรไฟล์ตัวเอง
exports.myProfile = async (req, res, next) => {
    try {
        const user = await Users.findByPk(req.session.userId);
        if (!user) {
            return res.status(401).json({ message: '⚠️ Unauthorized' });
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

// 📌 ลบโปรไฟล์ตัวเอง
exports.deleteMyProfile = async (req, res, next) => {
    try {
        await Users.destroy({ where: { id: req.session.userId } });
        res.status(200).json({ message: '🎉 Your profile has been deleted successfully!' });
    } catch (err) {
        next(err);
    }
};

// 📌 อัพเดทโปรไฟล์ตัวเอง
exports.updateMyProfile = async (req, res, next) => {
    try {
        const { err, value } = updateSchema.validate(req.body)
        if (err) {
            return res.status(400).json({ message: err.details[0].message });
        }
        const user = await Users.findByPk(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: '⚠️ User not found' });
        }
        if (req.body.username) {
            user.username = escapeHtml(req.body.username)
        }
        //  ตรวจสอบสิทธิ์ในการเปลี่ยน role
        if (req.body.role && req.user && req.user.role !== 'admin') {
            return res.status(403).json({ message: '⚠️ Only admins can change user roles' });
        }

        Object.assign(user, value) // 💡 อัปเดตข้อมูลเฉพาะที่มีใน req.body
        await user.save(); // 💡 ใช้ user.save() เพื่ออัปเดตข้อมูล

        res.status(200).json({ message: '🎉 Your profile updated successfully!', user: user });
    } catch (err) {
        next(err);
    }
};

// 📌 เปลี่ยนรหัสผ่าน
exports.changePassword = async (req, res, next) => {
    try {
        const { err, value } = changePassword.validate(req.body)
        if (err) {
            return res.status(400).json({ message: err.details[0].message });
        }
        const { oldPassword, newPassword } = value

        const user = await Users.findByPk(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: '⚠️ User not found' });
        }

        // 💡 ตรวจสอบรหัสผ่านเดิม
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: '⚠️ Incorrect old password' });
        }

        let hashedPassword;
        hashedPassword = await bcrypt.hash(newPassword, 12); // 💡 เข้ารหัสรหัสผ่านใหม่

        user.password = hashedPassword // 💡 อัปเดตรหัสผ่านในฐานข้อมูล
        await user.save()

        // ทำลาย session
        req.session.destroy((err) => {
            if (err) {
                return next(err)
            }
        })
        res.status(200).json({ message: '🎉 Password changed successfully! ⚠️ Please login again', redirect: '/auth/login' });
    } catch (err) {
        next(err);
    }
};

// 📌 ลืมรหัสผ่าน
exports.forgetPassword = async (req, res, next) => {
    try {
        // 💡 ตรวจสอบ req.body
        const { err, value } = emailVerify.validate(req.body)
        if (err) {
            return res.status(400).json({ message: err.details[0].message });
        }
        const { email } = value
        // 💡 ตรวจสอบอีเมล
        const user = await Users.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: '⚠️ User not found' });
        }
        // 💡 สร้าง token
        const token = uuidV4()
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 💡 1 ชั่วโมง
        await PasswordResetTokens.create({ email, token, expiresAt })
        // 💡 สร้าง link รีเซ็ต
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
        // 💡 สร้างเนื้อหาอีเมล
        const emailContent = `
            <p>You have requested to reset your password. Please click the following link to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 1 hour.</p>
        `;
        // 💡 ส่งอีเมล
        await sendEmail({
            to: email,
            subject: 'Password reset request',
            html: emailContent,
        })
        res.status(200).json({ message: '✉️ Password reset link sent to your email!', user: user });
    } catch (err) {
        next(err);
    }
}

// 📌 รีเซ็ตรหัสผ่าน
exports.resetPassword = async (req, res, next) => {
    try {
        // 💡 ตรวจสอบ req.body
        const { err, value } = resetPassword.validate(req.body)
        if (err) {
            return res.status(400).json({ message: err.details[0].message });
        }
        const { token, newPassword } = value
        // 💡 ตรวจสอบ token ในฐานข้อมูล
        const passwordResetToken = PasswordResetTokens.findOne({ token })
        if (!passwordResetToken || passwordResetToken.expiresAt < new Date()) {
            return res.status(400).json({ message: '⚠️ Invalid or expired token' })
        }

        // 💡 อัพเดทรหัสผ่านผู้ใช้
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await Users.updateOne({ email: passwordResetToken.email }, { password: hashedPassword })
        // 💡 ลบ token ออกจากฐานข้อมูล
        await PasswordResetTokens.deleteOne({ token })
        res.status(200).json({ message: '🎉 Password reset successfully' })
    } catch (err) {
        next(err);
    }
}