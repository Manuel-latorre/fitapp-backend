import { Request, Response, NextFunction } from 'express';
export declare class InvitationController {
    static inviteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    static verifyInvitation(req: Request, res: Response, next: NextFunction): Promise<void>;
    static completeRegistration(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPendingInvitations(req: Request, res: Response, next: NextFunction): Promise<void>;
    static cancelInvitation(req: Request, res: Response, next: NextFunction): Promise<void>;
    static resendInvitation(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=invitationController.d.ts.map