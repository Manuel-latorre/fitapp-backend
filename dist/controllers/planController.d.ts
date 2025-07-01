import { Request, Response, NextFunction } from 'express';
export declare class PlanController {
    static getAllPlans(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPlanById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createPlan(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updatePlan(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deletePlan(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createBlock(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createExercise(req: Request, res: Response, next: NextFunction): Promise<void>;
    static completeSession(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=planController.d.ts.map