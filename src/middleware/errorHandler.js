const { Sequelize } = require('../config/sequelize');

exports.errorHandler = (err, req, res, next) => {
    console.log(err.stack);

    let statusCode = 500;
    let message = '⚠️ Something went wrong';

    //  ข้อผิดพลาดเรื่องตวามถูกต้อง
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }
    //  ข้อผิดพลาดทาง database
    else if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = err.message;
    }
    //  database unique ควรมีค่าไม่ซ้ำกัน
    else if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        message = err.message;
    }
    //  database ไม่พร้อมใช้งาน
    else if (err.name === 'SequelizeConnectionError') {
        statusCode = 503;
        message = '⚠️ Database connection error';
    }
    else if (err instanceof Sequelize.Error) {
        statusCode = 500;
        message = '⚠️ Database error';
    }
    //  ข้อผิดพลาดที่กำหนดเอง
    if (err.name === 'CustomError') {
        statusCode = err.statusCode !== undefined ? err.statusCode : 500;
        message = err.message || '⚠️ Custom error occurred';
    }
    //  Syntax Error (JSON)
    else if (err instanceof SyntaxError && err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = '⚠️ Invalid JSON payload';
    }
    //   ข้อผิดพลาดการได้รับอนุญาติ
    else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = '⚠️ Unauthorized access';
    }
    //  ข้อผิดพลาดไม่พบทรัพยากร
    else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = err.message || '⚠️ Not Found';
    }
    //  ข้อผิดพลาดที่วไป
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = `⚠️ Invalid data provided: ${err.message}`;
    }
    res.status(statusCode).json({
        message: message,
        error: process.env.NODE_ENV === 'development' ? err : {},
    });
};