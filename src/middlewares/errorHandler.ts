import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
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
  if (error instanceof ZodError) {
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

export const createError = (message: string, statusCode: number = 500): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  return error;
};