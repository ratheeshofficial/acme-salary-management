import path from 'path';

import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ACME Salary Management API',
      version: '1.0.0',
      description:
        'HR Manager API for employees, local-currency salary history, and USD dashboard analytics.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../modules/**/*.routes.ts').replace(/\\/g, '/'),
    path.join(__dirname, '../modules/**/*.routes.js').replace(/\\/g, '/'),
  ],
});
