const express = require('express')
const session = require('express-session')
const cors = require('cors')
const helmet = require('helmet')
const app = express()
const mongoStore = require('connect-mongo')
const swaggerUi = require('swagger-ui-express')

const connectDB = require('./config/mongo.config')
const passport = require('./config/passport.config')
const { errorHandler } = require('./middleware/errorHandler')
const { apiLimiter } = require('./middleware/rateLimiter').apiLimiter
const { specs } = require('./config/swagger')

const authRoute = require('./routes/auth.route')
const productRoute = require('./routes/products.route')
const userRoute = require('./routes/users.route')

connectDB(); // 💡 เชื่อมต่อ MongoDB

app.use(cors())   // 💡 ใช้ในการอนุญาติให้เข้าถึง API
app.use(helmet()) // 💡 ใช้ป้องกันการโจมตีด้วยการตั้งค่า HTTP header
app.use(express.json())  // 💡 ใช้แปลง JSON ใน request body

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        secure: false, // 💡 ตั้งเป็น true ใน production สำหรับ HTTPS
        maxAge: 30 * 60 * 1000, // 💡 ตั้งไว้ 30 นาที
    },
    rolling: true, // 💡 เพื่อให้ session ID ถูกสร้างใหม่
    store: mongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions' // 💡 ชื่อ collection ที่เก็บ session
    })
}))

app.use(apiLimiter)
app.use(errorHandler)
app.use(passport.initialize())
app.use(passport.session())

// 📌 กำหนดเส้นทาง
app.use('/auth', authRoute) // 💡 เส้นทางยืนยันตน
app.use('/products', productRoute) // 💡 เส้นทางสินค้า
app.use('/users', userRoute) // 💡 เส้นทางผู้ใช้

// 📌 API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = app