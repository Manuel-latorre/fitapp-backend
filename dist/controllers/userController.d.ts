import { Request, Response, NextFunction } from 'express';
export declare class UserController {
    static getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getUserPlans(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=userController.d.ts.map