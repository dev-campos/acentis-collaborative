import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import dotenv from 'dotenv'
dotenv.config()

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My App API',
            version: '1.0.0',
            description: 'API documentation for My App',
        },
        servers: [
            {
                url: process.env.BASE_URL,
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
