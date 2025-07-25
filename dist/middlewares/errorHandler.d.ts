import { Request, Response, NextFunction } from 'express';
export interface CustomError extends Error {
    statusCode?: number;
    code?: string;
}
export declare const errorHandler: (error: CustomError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const createError: (message: string, statusCode?: number) => CustomError;
//# sourceMappingURL=errorHandler.d.ts.map