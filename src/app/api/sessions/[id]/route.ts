import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { updateSessionSchema } from '@/lib/validations';
import { sendEmail, generateAppointmentConfirmationToPatient } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    await requireAdmin(request);
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = updateSessionSchema.parse({
      id: resolvedParams.id,
      ...body,
    });

    // Obtener la sesión actual para comparar cambios
    const currentSession = await prisma.session.findUnique({
      where: { id: resolvedParams.id },
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

    if (!currentSession) {
      return NextResponse.json(
        { message: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar la sesión
    const updatedSession = await prisma.session.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.startTime && {
          startTime: new Date(validatedData.startTime),
        }),
        ...(validatedData.endTime && {
          endTime: new Date(validatedData.endTime),
        }),
        ...(validatedData.details !== undefined && {
          details: validatedData.details,
        }),
        ...(validatedData.observations !== undefined && {
          observations: validatedData.observations,
        }),
        ...(validatedData.status && {
          status: validatedData.status,
        }),
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

    // Si cambió el estado a CONFIRMED o CANCELLED, enviar email al paciente
    if (
      validatedData.status &&
      validatedData.status !== currentSession.status &&
      (validatedData.status === 'CONFIRMED' || validatedData.status === 'CANCELLED') &&
      updatedSession.user
    ) {
      const emailData = generateAppointmentConfirmationToPatient(
        `${updatedSession.user.firstName} ${updatedSession.user.lastName}`,
        updatedSession.startTime,
        updatedSession.endTime,
        validatedData.status
      );

      await sendEmail({
        to: updatedSession.user.email,
        subject: emailData.subject,
        html: emailData.html,
      });
    }

    return NextResponse.json({
      id: updatedSession.id,
      startTime: updatedSession.startTime,
      endTime: updatedSession.endTime,
      status: updatedSession.status,
      details: updatedSession.details,
      observations: updatedSession.observations,
    });

  } catch (error) {
    console.error('Error actualizando sesión:', error);

    if (error instanceof Error) {
      if (error.message.includes('Token') || error.message.includes('Acceso denegado')) {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    await requireAdmin(request);

    // Verificar que la sesión existe
    const session = await prisma.session.findUnique({
      where: { id: resolvedParams.id },
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

    if (!session) {
      return NextResponse.json(
        { message: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la sesión
    await prisma.session.delete({
      where: { id: resolvedParams.id },
    });

    // Enviar email de cancelación al paciente si tiene user
    if (session.user) {
      const emailData = generateAppointmentConfirmationToPatient(
        `${session.user.firstName} ${session.user.lastName}`,
        session.startTime,
        session.endTime,
        'CANCELLED'
      );

      await sendEmail({
        to: session.user.email,
        subject: emailData.subject,
        html: emailData.html,
      });
    }

    return NextResponse.json(
      { message: 'Sesión eliminada correctamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error eliminando sesión:', error);

    if (error instanceof Error && (error.message.includes('Token') || error.message.includes('Acceso denegado'))) {
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
