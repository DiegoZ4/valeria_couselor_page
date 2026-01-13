import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const updateSlotSchema = z.object({
  isRecurring: z.boolean().optional(),
  dayOfWeek: z.number().min(0).max(6).nullable().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    await requireAdmin(request);
    const body = await request.json();

    const validatedData = updateSlotSchema.parse(body);

    const slot = await prisma.timeSlot.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.isRecurring !== undefined && {
          isRecurring: validatedData.isRecurring,
        }),
        ...(validatedData.dayOfWeek !== undefined && {
          dayOfWeek: validatedData.dayOfWeek,
        }),
        ...(validatedData.startTime && {
          startTime: new Date(validatedData.startTime),
        }),
        ...(validatedData.endTime && {
          endTime: new Date(validatedData.endTime),
        }),
        ...(validatedData.isActive !== undefined && {
          isActive: validatedData.isActive,
        }),
      },
    });

    return NextResponse.json(slot);

  } catch (error) {
    console.error('Error updating slot:', error);

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

    await prisma.timeSlot.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json(
      { message: 'Horario eliminado correctamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting slot:', error);

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
