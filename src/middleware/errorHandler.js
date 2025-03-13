exports.errorHandler = (err, req, res, next) => {
    console.log(err.stack)

    let statusCode = 500
    let message = '⚠️ Something went wrong'

    // 💡 ข้อผิดพลาดเรื่องตวามถูกต้อง
    if (err.name === 'ValidationError') {
        statusCode = 400
        message = err.message;
    }
    // 💡 ข้อผิดพลาดทาง database
    if (err.name === 'DatabaseError') {
        statusCode = 503;
        message = err.message;
    }
    // 💡 ข้อผิดพลาดที่กำหนดเอง
    if (err.name === 'CustomError') {
        statusCode = err.statusCode || 500;
        message = err.message || '⚠️ Custom error occurred';
    }
    // 💡 Syntax Error (JSON)
    else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400
        message = '⚠️ Invalid JSON payload';
    }
    //  💡 ข้อผิดพลาดการได้รับอนุญาติ
    else if (err.name === 'UnauthorizedError') {
        statusCode = 401
        message = '⚠️ Unauthorized access';
    }
    //  💡 ข้อผิดพลาดไม่พบทรัพยากร
    else if (err.name === 'NotFoundError') {
        statusCode = 404
        message = err.message || '⚠️ Not Found';
    }
    //  💡 ข้อผิดพลาดที่วไป
    else if (err.name === 'CastError') {
        statusCode = 400
        message = '⚠️ Invalid data provided';
    }
    res.status(statusCode).json({
        message: message,
        error: process.env.NODE_ENV === 'development' ? err : {},
    })
}
