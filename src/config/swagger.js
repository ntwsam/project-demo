const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API Documentation',
        },
        servers: [
            {
                url: process.env.BASE_URL, // หรือ URL ของ server ของคุณ
            },
        ],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'], // ระบุ path ของไฟล์ที่มี Swagger documentation
};

const specs = swaggerJsdoc(options);

module.exports = {specs}