import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'noreply@example.com';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html || this.getTemplate(options.template || 'default', options.data),
        text: options.text
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data?.id };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  static async sendWelcomeEmail(to: string, userName: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to,
      subject: '¡Bienvenido a nuestra plataforma!',
      template: 'welcome',
      data: { userName }
    });
  }

  static async sendPasswordResetEmail(to: string, resetLink: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to,
      subject: 'Restablece tu contraseña',
      template: 'password-reset',
      data: { resetLink }
    });
  }

  static async sendNotificationEmail(to: string, title: string, message: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to,
      subject: title,
      template: 'notification',
      data: { title, message }
    });
  }



  private static getTemplate(template: string, data: Record<string, any> = {}): string {
    const templates: Record<string, (data: Record<string, any>) => string> = {
      default: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hola!</h2>
          <p>Este es un mensaje desde nuestra aplicación.</p>
          ${data.message ? `<p>${data.message}</p>` : ''}
        </div>
      `,
      welcome: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">¡Bienvenido ${data.userName}!</h1>
          <p>Gracias por unirte a nuestra plataforma. Estamos emocionados de tenerte con nosotros.</p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Este es un correo automático, por favor no respondas.</p>
        </div>
      `,
      'password-reset': (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Restablece tu contraseña</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${data.resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
            Restablecer contraseña
          </a>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p style="color: #666; font-size: 12px;">Este enlace expirará en 24 horas.</p>
        </div>
      `,
      notification: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">${data.title}</h2>
          <p>${data.message}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Notificación automática del sistema.</p>
        </div>
      `
    };

    return templates[template] ? templates[template](data) : templates.default(data);
  }
}