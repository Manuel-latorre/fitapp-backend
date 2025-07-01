import { Request, Response, NextFunction } from 'express';
export declare class TrackingController {
    static getAllTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getTrackingByUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getTrackingByExercise(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
    static markAsDone(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getUserStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=trackingController.d.ts.map