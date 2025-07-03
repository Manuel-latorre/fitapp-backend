"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'FitApp <noreply@martupf.com>';
class EmailService {
    static async sendEmail(options) {
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
        }
        catch (error) {
            console.error('Email service error:', error);
            return { success: false, error: 'Failed to send email' };
        }
    }
    static async sendWelcomeEmail(to, userName) {
        return this.sendEmail({
            to,
            subject: '¡Bienvenido a nuestra plataforma!',
            template: 'welcome',
            data: { userName }
        });
    }
    static async sendPasswordResetEmail(to, resetLink) {
        return this.sendEmail({
            to,
            subject: 'Restablece tu contraseña',
            template: 'password-reset',
            data: { resetLink }
        });
    }
    static async sendNotificationEmail(to, title, message) {
        return this.sendEmail({
            to,
            subject: title,
            template: 'notification',
            data: { title, message }
        });
    }
    static async sendInvitationEmail(to, magicLink, invitedByName, role) {
        return this.sendEmail({
            to,
            subject: `Invitación a FitApp - ${invitedByName} te ha invitado`,
            template: 'invitation',
            data: {
                magicLink,
                invitedByName,
                role,
                appName: 'FitApp'
            }
        });
    }
    static getTemplate(template, data = {}) {
        const templates = {
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
      `,
            invitation: (data) => `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <!-- Header con logo -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 32px; font-weight: bold;">F</span>
              </div>
              <h1 style="color: #2c3e50; margin: 0; font-size: 28px; font-weight: 600;">¡Invitación a FitApp!</h1>
              <p style="color: #7f8c8d; margin: 10px 0 0; font-size: 16px;">Tu plataforma de entrenamiento personal</p>
            </div>
            
            <!-- Contenido principal -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <p style="color: #34495e; font-size: 18px; line-height: 1.6; margin: 0 0 15px;">
                Hola, <strong>${data.invitedByName}</strong> te ha invitado a unirte a FitApp como <strong>${data.role === 'trainer' ? 'Entrenador' : 'Usuario'}</strong>.
              </p>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0;">
                Para completar tu registro, haz clic en el siguiente botón:
              </p>
            </div>
            
            <!-- Botón de acción -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${data.magicLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 18px 40px; 
                        text-decoration: none; 
                        border-radius: 30px; 
                        display: inline-block; 
                        font-weight: 600;
                        font-size: 18px;
                        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                        transition: all 0.3s ease;">
                🚀 Completar Registro
              </a>
            </div>
            
            <!-- Enlace alternativo -->
            <div style="background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #7f8c8d; font-size: 14px; text-align: center; margin: 0 0 10px;">
                <strong>¿No funciona el botón?</strong> Copia y pega este enlace:
              </p>
              <p style="background: white; padding: 12px; border-radius: 6px; margin: 0; word-break: break-all;">
                <a href="${data.magicLink}" style="color: #3498db; text-decoration: none; font-size: 13px;">${data.magicLink}</a>
              </p>
            </div>
            
            <!-- Información importante -->
            <div style="background: #e8f4fd; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3498db;">
              <h3 style="color: #2c3e50; margin: 0 0 15px; font-size: 18px;">📋 Información importante:</h3>
              <ul style="color: #34495e; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Este enlace expira en <strong>7 días</strong></li>
                <li>Solo necesitarás crear tu contraseña</li>
                <li>Tu nombre y teléfono ya están configurados</li>
                <li>Si tienes problemas, contacta al administrador</li>
              </ul>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                Este es un correo automático de <strong>FitApp</strong>.<br>
                Enviado desde <strong>noreply@martupf.com</strong>
              </p>
              <p style="color: #bdc3c7; font-size: 11px; margin: 10px 0 0;">
                No respondas a este mensaje. Si necesitas ayuda, contacta al administrador.
              </p>
            </div>
          </div>
        </div>
      `
        };
        return templates[template] ? templates[template](data) : templates.default(data);
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.js.map