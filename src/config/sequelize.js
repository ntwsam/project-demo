require('dotenv').config();
const mysql = require('mysql2/promise')
const { Sequelize } = require('sequelize');

// 📌 สร้าง ฉนืืำแะรนื สำหรับจัดการ database
const dbConnection= mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

// 📌 Sequelize
exports.sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT,
        logging: false,
    }
)

// 📌 ตรวจสอบ database
async function foundDatabase(){
    try{
        const [rows] = await dbConnection.execute(
            'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
            [process.env.DB_NAME]
        )
        if (rows.length === 0){
            console.log(`🛠️ Database "${process.env.DB_NAME}" does not exist. Creating...`)
            await dbConnection.execute(
                `CREATE DATABASE ${process.env.DB_NAME}`
            )
            console.log(`✔️ Database "${process.env.DB_NAME}" created successfully`)
        } else
            console.log(`✔️ Database "${process.env.DB_NAME}" already exists`)
    } catch(err){
        console.error('✖️ Error creating or checking database:', err)
        throw err
    }
}

async function testConnection() {
    try {
        // 💡 ตรวจสอบ database
        await foundDatabase()
        // 💡 ลองเชื่อมต่อด้วย Sequelize
        await exports.sequelize.authenticate();
        console.log('✔️ Connection to the database has been established successfully.');
        // 💡 ตรวจสอบโครงสร้างให้ตรงกับ model
        await exports.sequelize.sync({ alter: true })
        console.log('✔️ Database synchronized')
    } catch (error) {
        console.error('✖️ Unable to connect to the database:', error);
    } finally {
        if (foundDatabase){
            await foundDatabase.end()
        }
    }
}

// 📌 เรียกเทสการเชื่อมต่อ
testConnection()