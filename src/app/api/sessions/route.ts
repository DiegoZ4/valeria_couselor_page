import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sessionSchema } from '@/lib/validations';
import { sendEmail, generateAppointmentEmailToAdmin } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = sessionSchema.parse(body);

    // Verificar que el horario no esté ocupado
    const existingSession = await prisma.session.findFirst({
      where: {
        startTime: {
          lte: new Date(validatedData.endTime),
        },
        endTime: {
          gte: new Date(validatedData.startTime),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingSession) {
      return NextResponse.json(
        { message: 'El horario seleccionado no está disponible' },
        { status: 409 }
      );
    }

    // Crear sesión
    const session = await prisma.session.create({
      data: {
        userId: user.userId,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        details: validatedData.details,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Enviar email a los administradores
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });

    // Enviar email a administradores si el usuario existe
    if (session.user) {
      const emailData = generateAppointmentEmailToAdmin(
        `${session.user.firstName} ${session.user.lastName}`,
        session.user.email,
        session.startTime,
        session.endTime,
        session.details || undefined
      );

      // Enviar emails a todos los administradores
      for (const admin of adminUsers) {
        await sendEmail({
          to: admin.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      }
    }

    return NextResponse.json(
      {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        details: session.details,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creando sesión:', error);

    if (error instanceof Error) {
      if (error.message.includes('Token')) {
        return NextResponse.json(
          { message: error.message },
          { status: 401 }
        );
      }

      if (error.name === 'ZodError') {
        return NextResponse.json(
          { message: 'Datos inválidos', errors: error },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Si es admin, puede ver todas las sesiones
    if (user.role === 'ADMIN') {
      const sessions = await prisma.session.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      return NextResponse.json(sessions);
    } else {
      // Si es paciente, solo puede ver sus propias sesiones
      const sessions = await prisma.session.findMany({
        where: {
          userId: user.userId,
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      return NextResponse.json(sessions);
    }

  } catch (error) {
    console.error('Error obteniendo sesiones:', error);

    if (error instanceof Error && error.message.includes('Token')) {
      return NextResponse.json(
        { message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
