export interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    template?: string;
    data?: Record<string, any>;
}
export declare class EmailService {
    static sendEmail(options: EmailOptions): Promise<{
        success: boolean;
        id?: string;
        error?: string;
    }>;
    static sendWelcomeEmail(to: string, userName: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    static sendPasswordResetEmail(to: string, resetLink: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    static sendNotificationEmail(to: string, title: string, message: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    private static getTemplate;
}
//# sourceMappingURL=email.d.ts.map