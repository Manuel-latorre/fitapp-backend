"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const library_1 = require("@prisma/client/runtime/library");
const zod_1 = require("zod");
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    // Prisma errors
    if (error instanceof library_1.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'A record with this data already exists'
                });
            case 'P2025':
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Record not found'
                });
            default:
                return res.status(500).json({
                    error: 'Database Error',
                    message: 'An error occurred while processing your request'
                });
        }
    }
    // Zod validation errors
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: error.errors
        });
    }
    // Custom application errors
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            error: error.name || 'Application Error',
            message: error.message
        });
    }
    // Default server error
    return res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development'
            ? error.message
            : 'Something went wrong'
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map