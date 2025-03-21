const nodemailer = require('nodemailer')


const sendEmail = async (options) => {
    // 💡 สร้าง transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    // 💡 กำหนด option
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
    }
    // 💡 ส่งอีเมล
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail