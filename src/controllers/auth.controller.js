const pool = require("../config/mysql.config")
const bcrypt = require("bcryptjs")
const escapeHtml = require("escape-html") // 💡 ไว้ป้องกัน XSS attacks
const {adminRegisterSchema, registerSchema} = require("../utils/registerSchema");
const { v4: uuidV4 } = require('uuid');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for user authentication
 */

// 📌 ลงทะเบียน admin
/**
 * @swagger
 * paths:
 *   /admin/register:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Register a new administrator
 *       description: This endpoint allows the registration of an administrator user. The registration requires a valid email, password, and a secret key for the admin.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "admin@example.com"
 *                   description: The email of the administrator.
 *                 username:
 *                   type: string
 *                   example: "adminuser"
 *                   description: The username for the administrator.
 *                 password:
 *                   type: string
 *                   minLength: 8
 *                   example: "password123"
 *                   description: The password for the administrator account.
 *                 secretKey:
 *                   type: string
 *                   example: "admin-secret-key"
 *                   description: The secret key for admin authentication.
 *                 phone:
 *                   type: string
 *                   example: "123-456-7890"
 *                   description: The phone number of the administrator.
 *               required:
 *                 - email
 *                 - username
 *                 - password
 *                 - secretKey
 *                 - phone
 *       responses:
 *         '201':
 *           description: Administrator registered successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "🎉 Administrator registered successfully!"
 *                   user:
 *                     type: object
 *                     properties:
 *                       uuid:
 *                         type: string
 *                         example: "abcd-1234-efgh-5678"
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       email:
 *                         type: string
 *                         example: "admin@example.com"
 *                       username:
 *                         type: string
 *                         example: "adminuser"
 *                       role:
 *                         type: string
 *                         example: "admin"
 *                       phone:
 *                         type: string
 *                         example: "123-456-7890"
 *         '400':
 *           description: Invalid input or email already exists
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "⚠️ Email already exists"
 *         '403':
 *           description: Invalid secret key
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Invalid key."
 *         '500':
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "⚠️ Something went wrong"
 */

exports.adminRegister = async (req, res, next) => {
    try {
        const {err, value} = adminRegisterSchema.validate(req.body);
        if (err) {
            res.status(400).json({message: err.details[0].message});
        }
        // 💡 rename username จาก server
        const {email, username: rawUsername, password, phone ,secretKey} = value
        // 💡 escape username
        const username = escapeHtml(rawUsername)
        // 💡 ตรวจสอบ admin secret key
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({message: "Invalid key."})
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        // 💡 ตรวจสอบ email
        const [existingUser] = await pool.promise().query('SELECT * FROM Users WHERE email = ?', [email])
        if (existingUser.length > 0) {
            return res.status(400).json({message: '⚠️ Email already exists'});
        }
        // 💡 เพิ่มข้อมูล
        const uuid = uuidV4()
        let role = "admin"
        const [result] = await pool.promise().query('INSERT INTO Users (uuid, email, username, password, phone, role) VALUES (?, ?,?,?,?)',
            [uuid, email, username, hashedPassword, phone, role]);
        res.status(201).json({
            message: '🎉 Administrator registered successfully!',
            user: {
                uuid: uuid,
                id: result.insertId,
                email: req.body.email,
                username: req.body.username,
                role: 'admin',
                phone: req.body.phone
            }
        })
    }
    catch(err){
        next(err)
    }
}

// 📌 ลงทะเบียน
/**
 * @swagger
 * paths:
 *   /register:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Register a new user
 *       description: This endpoint allows the registration of a user. The user must provide a valid email, password, and role (either customer or seller).
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *                   description: The email of the user.
 *                 username:
 *                   type: string
 *                   example: "newuser"
 *                   description: The username for the user.
 *                 password:
 *                   type: string
 *                   minLength: 8
 *                   example: "password123"
 *                   description: The password for the user account.
 *                 role:
 *                   type: string
 *                   enum: ["customer", "seller"]
 *                   example: "customer"
 *                   description: The role of the user. Can be either "customer" or "seller".
 *                 phone:
 *                   type: string
 *                   example: "098-765-4321"
 *                   description: The phone number of the user.
 *               required:
 *                 - email
 *                 - username
 *                 - password
 *                 - role
 *                 - phone
 *       responses:
 *         '201':
 *           description: User registered successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "🎉 User registered successfully!"
 *                   user:
 *                     type: object
 *                     properties:
 *                       uuid:
 *                         type: string
 *                         example: "abcd-5678-efgh-1234"
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       username:
 *                         type: string
 *                         example: "newuser"
 *                       role:
 *                         type: string
 *                         example: "customer"
 *                       phone:
 *                         type: string
 *                         example: "098-765-4321"
 *         '400':
 *           description: Invalid input or email already exists
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "⚠️ Email already exists"
 *         '500':
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "⚠️ Something went wrong"
 */

exports.register = async (req, res, next) => {
    try {
        const {err, value} = registerSchema.validate(req.body)
        if (err) {
            res.status(400).json({message: err.details[0].message});
        }
        // 💡 rename username จาก server
        const {email, username: rawUsername, password, phone, role} = value
        // 💡 escape username
        const username = escapeHtml(rawUsername)
        const hashedPassword = await bcrypt.hash(password, 12);
        // 💡 ตรวจสอบ email
        const [existingUser] = await pool.promise().query('SELECT * FROM Users WHERE email = ?', [email])
        if (existingUser.length > 0) {
            return res.status(400).json({message: '⚠️ Email already exists'});
        }
        // 💡 เพิ่มข้อมูล
        const uuid = uuidV4()
        const [result] = await pool.promise().query('INSERT INTO Users (uuid, email, username, password, phone, role) VALUES (?, ?,?,?,?)',
            [uuid ,email, username, hashedPassword, phone, role]);
        res.status(201).json({
            message: '🎉 User registered successfully!',
            user: {
                uuid: result.uuid,
                id: result.id,
                email: result.email,
                username: result.username,
                role: result.role,
                phone: result.phone
            }
        })
    }
    catch (err) {
        next(err);
    }
}

// 📌 ลงชื่อเข้าสู่ระบบ
/**
 * @swagger
 * paths:
 *   /login:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: User login
 *       description: This endpoint allows the user to log in using their email and password.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *                   description: The email of the user.
 *                 password:
 *                   type: string
 *                   example: "password123"
 *                   description: The password for the user account.
 *               required:
 *                 - email
 *                 - password
 *       responses:
 *         '200':
 *           description: Login successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "🎉 Login Successfully"
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       uuid:
 *                         type: string
 *                         example: "abcd-1234-efgh-5678"
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       username:
 *                         type: string
 *                         example: "newuser"
 *                       role:
 *                         type: string
 *                         example: "customer"
 *                       phone:
 *                         type: string
 *                         example: "098-765-4321"
 *         '401':
 *           description: Invalid credentials
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "⚠️ Invalid credentials"
 *         '500':
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "⚠️ Something went wrong"
 */

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body
        // 💡 ค้นหา User
        const [users] = await pool.promise().query('SELECT * FROM Users WHERE email = ?', [email])
        if (users.length === 0) {
            return res.status(401).json({message: '⚠️ Invalid credentials'})
        }
        const user = users[0]
        // 💡 ตรวจสอบ password
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return res.status(401).json({message: '⚠️ Invalid credentials'})
        }
        // 💡 สร้าง session
        req.session.userId = user.id
        res.status(200).json({
            message: '🎉 Login Successfully',
            user: {
                id: user.id,
                uuid: user.uuid,
                email: user.email,
                username: user.username,
                role: user.role,
                phone: user.phone
            }
        })
    }
    catch (err) {
        next(err);
    }

}

// 📌 ลงชื่อออกจากระบบ
/**
 * @swagger
 * paths:
 *   /logout:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: User logout
 *       description: This endpoint allows the user to log out by destroying the session.
 *       responses:
 *         '200':
 *           description: Logout successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "🎉 Logout successfully!"
 *         '401':
 *           description: Not logged in
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "⚠️ Not logged in"
 *         '500':
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "⚠️ Something went wrong"
 */

exports.logout = async (req, res, next) => {
    if (req.session && req.session.userId) { // ตรวจสอบว่ามี session และ user อยู่หรือไม่
        req.session.destroy((err) => {
            if (err) {
                console.error('⚠️ Error destroying session:', err);
                return next(err);
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: '🎉 Logout successfully!' });
        });
    } else {
        res.status(401).json({ message: '⚠️ Not logged in' });
    }
};