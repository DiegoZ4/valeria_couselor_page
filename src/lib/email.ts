import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes cambiar esto por tu proveedor de email
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailData) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@valeria-russo-psicologia.com',
      to,
      subject,
      html,
    });

    console.log('Email enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
}

export function generateAppointmentEmailToAdmin(
  patientName: string,
  patientEmail: string,
  startTime: Date,
  endTime: Date,
  details?: string
) {
  return {
    subject: `Nueva Solicitud de Turno - ${patientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Nueva Solicitud de Turno</h2>
        
        <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalles del Paciente:</h3>
          <p><strong>Nombre:</strong> ${patientName}</p>
          <p><strong>Email:</strong> ${patientEmail}</p>
        </div>
        
        <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalles de la Sesión:</h3>
          <p><strong>Fecha y Hora de Inicio:</strong> ${startTime.toLocaleString('es-AR')}</p>
          <p><strong>Fecha y Hora de Fin:</strong> ${endTime.toLocaleString('es-AR')}</p>
          ${details ? `<p><strong>Detalles adicionales:</strong> ${details}</p>` : ''}
        </div>
        
        <p style="margin-top: 30px;">
          Por favor, revisa la solicitud en el panel de administración para confirmar o rechazar el turno.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          Este email fue generado automáticamente por el sistema de turnos de Valeria Russo - Consultoría Psicológica.
        </p>
      </div>
    `,
  };
}

export function generateAppointmentConfirmationToPatient(
  patientName: string,
  startTime: Date,
  endTime: Date,
  status: 'CONFIRMED' | 'CANCELLED'
) {
  const isConfirmed = status === 'CONFIRMED';

  return {
    subject: isConfirmed
      ? `Turno Confirmado - Valeria Russo Psicología`
      : `Turno Cancelado - Valeria Russo Psicología`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${isConfirmed ? '#059669' : '#DC2626'};">
          ${isConfirmed ? 'Turno Confirmado' : 'Turno Cancelado'}
        </h2>
        
        <p>Estimado/a ${patientName},</p>
        
        <p>
          ${isConfirmed
        ? 'Su turno ha sido confirmado con los siguientes detalles:'
        : 'Lamentamos informarle que su turno ha sido cancelado.'
      }
        </p>
        
        ${isConfirmed ? `
          <div style="background-color: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3>Detalles del Turno:</h3>
            <p><strong>Fecha y Hora:</strong> ${startTime.toLocaleString('es-AR')} - ${endTime.toLocaleString('es-AR')}</p>
            <p><strong>Duración:</strong> ${Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))} minutos</p>
          </div>
          
          <p><strong>Información importante:</strong></p>
          <ul>
            <li>Por favor, llegue 5 minutos antes de la hora programada</li>
            <li>Si necesita cancelar o reprogramar, hágalo con al menos 24 horas de anticipación</li>
            <li>Traiga su documento de identidad</li>
          </ul>
        ` : `
          <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
            <p>Si desea solicitar un nuevo turno, puede hacerlo a través de nuestro sitio web.</p>
          </div>
        `}
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          <strong>Valeria Russo - Consultoría Psicológica</strong><br>
          Para consultas, puede contactarnos a través de nuestro sitio web.
        </p>
      </div>
    `,
  };
}
