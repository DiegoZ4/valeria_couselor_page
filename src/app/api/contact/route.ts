import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = contactSchema.parse(body);

    // Email de destino (puede venir del body o usar el predeterminado)
    const destinationEmail = body.to || 'santiagojoeljesus@gmail.com';

    // Crear email para el destinatario
    const emailToAdmin = {
      subject: `Nuevo mensaje de contacto de ${validatedData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Nuevo Mensaje de Contacto</h2>
          
          <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Información del contacto:</h3>
            <p><strong>Nombre:</strong> ${validatedData.name}</p>
            <p><strong>Email:</strong> ${validatedData.email}</p>
            ${validatedData.phone ? `<p><strong>Teléfono:</strong> ${validatedData.phone}</p>` : ''}
          </div>
          
          <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Mensaje:</h3>
            <p style="white-space: pre-wrap;">${validatedData.message}</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            Este email fue generado automáticamente desde el formulario de contacto del sitio web.
          </p>
        </div>
      `,
    };

    // Crear email de confirmación para el usuario
    const emailToUser = {
      subject: 'Confirmación de mensaje recibido - Valeria Russo Psicología',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Mensaje Recibido</h2>
          
          <p>Estimado/a ${validatedData.name},</p>
          
          <p>
            Hemos recibido tu mensaje y te responderemos a la brevedad. 
            A continuación, encontrarás una copia de tu consulta:
          </p>
          
          <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Tu mensaje:</h3>
            <p style="white-space: pre-wrap;">${validatedData.message}</p>
          </div>
          
          <p>
            Si tu consulta es urgente, no dudes en contactarnos directamente por teléfono 
            al +54 11 1234-5678 durante nuestros horarios de atención.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            <strong>Valeria Russo - Consultoría Psicológica</strong><br>
            Matrícula Profesional: MP 12345<br>
            Horarios de atención: Lunes a Viernes 9:00-18:00, Sábados 9:00-13:00
          </p>
        </div>
      `,
    };

    // Enviar emails
    const emailPromises = [];

    // Enviar al email especificado (de prueba)
    emailPromises.push(
      sendEmail({
        to: destinationEmail,
        subject: emailToAdmin.subject,
        html: emailToAdmin.html,
      })
    );

    // Enviar confirmación al usuario
    emailPromises.push(
      sendEmail({
        to: validatedData.email,
        subject: emailToUser.subject,
        html: emailToUser.html,
      })
    );

    // Esperar a que se envíen todos los emails
    await Promise.all(emailPromises);

    return NextResponse.json(
      { message: 'Mensaje enviado correctamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error enviando mensaje de contacto:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
