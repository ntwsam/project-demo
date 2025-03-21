const express = require('express')
const router = express.Router()

const Users = require('../controllers/users.controller')
const { authorize, protect } = require('../middleware/auth.middleware')

// 📌 เช็ค login
router.use(protect);

// 📌 ดูรายชื่อผู้ใช้งานทั้งหมด (admin เท่านั้น)
router.get('/', authorize('admin'), Users.getAllUsers);

// 📌 ดูรายชื่อผู้ใช้งานผ่าน id (admin เท่านั้น)
router.get('/:id(\\d+)', authorize('admin'), Users.getUserById);

// 📌 อัพเดทผู้ใช้งานตาม id (admin เท่านั้น)
router.put('/:id(\\d+)', authorize('admin'), Users.updateUser);

// 📌 ลบผู้ใช้งาน (admin เท่านั้น)
router.delete('/:id(\\d+)', authorize('admin'), Users.deleteUser);

// 📌 ดูโปรไฟล์ตัวเอง
router.get('/profile/me', Users.myProfile);

// 📌 ลบโปรไฟล์ตัวเอง
router.delete('/profile/me', Users.deleteMyProfile);

// 📌 อัพเดทโปรไฟล์ตัวเอง
router.put('/profile/me', Users.updateMyProfile);

// 📌 เปลี่ยนรหัสผ่าน
router.put('/profile/change-password', Users.changePassword);

//  ลืมรหัสผ่าน
router.post('/forget-password', Users.forgetPassword);

//  รีเซ็ตรหัสผ่าน
router.post('/reset-password', Users.resetPassword);

module.exports = router;