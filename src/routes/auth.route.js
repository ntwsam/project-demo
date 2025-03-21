const express = require('express')
const router = express.Router()

const Auth = require('../controllers/auth.controller')
const { loginLimiter } = require('../middleware/rateLimiter').loginLimiter
const passport = require('../config/passport.config')

// 📌 admin
router.post('/admin/register', Auth.adminRegister)

// 📌 register
router.post('/register', Auth.register)

// 📌 login
router.post('/login', loginLimiter, Auth.login)

// 📌 logout
router.post('/logout', Auth.logout)

// 📌 refresh token
router.post('/refresh-token', Auth.refreshToken)

// 📌 google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/'); // หรือ redirect ไปยังหน้าที่ต้องการ
    }
)

// 📌 facebook login
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/'); // หรือ redirect ไปยังหน้าที่ต้องการ
    }
);

// 📌 gitHub login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/'); // หรือ redirect ไปยังหน้าที่ต้องการ
    }
);

module.exports = router