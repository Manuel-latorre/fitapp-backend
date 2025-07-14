import { Request, Response, NextFunction } from 'express';
export declare class WeekController {
    static getWeeksByPlan(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getWeekById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createWeek(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateWeek(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteWeek(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=weekController.d.ts.map