const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✔️ Connected to MongoDB database');
    } catch (err) {
        console.error('✖️ Failed to connect to MongoDB database:', err);
        process.exit(1); // 💡 ออกจากการทำงาน
    }
}

module.exports = connectDB;