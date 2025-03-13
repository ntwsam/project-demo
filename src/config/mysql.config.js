const mysql = require('mysql2');
require("dotenv").config();

// 📌 สร้างการเชื่อมต่อกับฐานข้อมูล
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

(async () => {
    try {
        const connection = await pool.promise().getConnection();
        console.log('✔️ Connected to MySQL database');
        connection.release();  // 💡 ปล่อย connection กลับสู่ pool หลังใช้งานเสร็จ
    } catch (err) {
        console.log('✖️ Failed to connect to MySQL database:', err);
    }
})();

module.exports = pool;