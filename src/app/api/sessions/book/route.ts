import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../../../lib/email';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      );
    }

    const { sessionId, details } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { message: 'ID de sesión requerido' },
        { status: 400 }
      );
    }

    // Check if session exists and is available
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { message: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    if (session.status !== 'PENDING' || session.userId) {
      return NextResponse.json(
        { message: 'Esta sesión ya no está disponible' },
        { status: 409 }
      );
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Update session with user and confirm it
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        userId: decoded.userId,
        status: 'CONFIRMED',
        details: details || null,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Send confirmation email to patient
    const patientEmailContent = `
      <h2>Confirmación de Turno - Valeria Mariana Russo</h2>
      <p>Estimado/a ${user.firstName} ${user.lastName},</p>
      <p>Su turno ha sido confirmado exitosamente.</p>
      
      <h3>Detalles del Turno:</h3>
      <ul>
        <li><strong>Fecha:</strong> ${new Date(session.startTime).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</li>
        <li><strong>Hora:</strong> ${new Date(session.startTime).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })} - ${new Date(session.endTime).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}</li>
        <li><strong>Duración:</strong> 40 minutos</li>
        ${details ? `<li><strong>Detalles:</strong> ${details}</li>` : ''}
      </ul>
      
      <p>Si necesita reprogramar o cancelar su turno, por favor contáctenos con anticipación.</p>
      <p>¡Esperamos verle pronto!</p>
      
      <p>Saludos cordiales,<br>
      Valeria Mariana Russo<br>
      Counselor</p>
    `;

    // Send email to patient
    await sendEmail({
      to: user.email,
      subject: 'Confirmación de Turno - Valeria Mariana Russo',
      html: patientEmailContent,
    });

    // Send notification to admin
    const adminEmailContent = `
      <h2>Nueva Reserva de Turno</h2>
      <p>Un paciente ha reservado un turno.</p>
      
      <h3>Detalles del Paciente:</h3>
      <ul>
        <li><strong>Nombre:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Teléfono:</strong> ${user.phone || 'No proporcionado'}</li>
      </ul>
      
      <h3>Detalles del Turno:</h3>
      <ul>
        <li><strong>Fecha:</strong> ${new Date(session.startTime).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</li>
        <li><strong>Hora:</strong> ${new Date(session.startTime).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })} - ${new Date(session.endTime).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}</li>
        ${details ? `<li><strong>Detalles del paciente:</strong> ${details}</li>` : ''}
      </ul>
    `;

    await sendEmail({
      to: 'admin@valeria-russo.com',
      subject: 'Nueva Reserva de Turno',
      html: adminEmailContent,
    });

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error('Error booking session:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
