const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API Documentation',
        },
        // components:{
        //     securitySchemes:{
        //         bearerAuth:{
        //             type: 'http',
        //             scheme: 'bearer',
        //             bearerFormat: 'JWT',
        //         }
        //     }
        // },
        servers: [
            {
                url: process.env.BASE_URL, // 💡 หรือ URL ของ server ของคุณ
            },
        ],
    },
    apis: ['./src/controllers/*.js'], // 💡 ระบุ path ของไฟล์ที่มี Swagger documentation
};

const specs = swaggerJsdoc(options);

module.exports = { specs }