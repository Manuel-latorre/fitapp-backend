import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static generateToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    static verifyToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map