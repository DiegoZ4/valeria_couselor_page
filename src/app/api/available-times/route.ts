import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { message: 'Fecha requerida' },
        { status: 400 }
      );
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Obtener slots recurrentes para este día de la semana
    const recurringSlots = await prisma.timeSlot.findMany({
      where: {
        isRecurring: true,
        dayOfWeek: dayOfWeek,
        isActive: true,
      },
    });

    // Obtener slots únicos para esta fecha específica
    const oneTimeSlots = await prisma.timeSlot.findMany({
      where: {
        isRecurring: false,
        isActive: true,
        startTime: {
          gte: new Date(selectedDate.toDateString()),
          lt: new Date(new Date(selectedDate.toDateString()).getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // Obtener sesiones ya reservadas para esta fecha
    const existingSessions = await prisma.session.findMany({
      where: {
        startTime: {
          gte: new Date(selectedDate.toDateString()),
          lt: new Date(new Date(selectedDate.toDateString()).getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    // Combinar slots y crear disponibilidad
    const allSlots = [...recurringSlots, ...oneTimeSlots];
    const availableSlots = [];

    for (const slot of allSlots) {
      let slotDateTime;

      if (slot.isRecurring) {
        // Para slots recurrentes, combinar la fecha seleccionada con la hora del slot
        const slotTime = new Date(slot.startTime);
        slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(slotTime.getHours(), slotTime.getMinutes(), 0, 0);
      } else {
        // Para slots únicos, usar la fecha/hora exacta
        slotDateTime = new Date(slot.startTime);
      }

      // Verificar si ya hay una sesión en este horario
      const isOccupied = existingSessions.some(session => {
        const sessionStart = new Date(session.startTime);
        return sessionStart.getTime() === slotDateTime.getTime();
      });

      if (!isOccupied && slotDateTime > new Date()) {
        const endDateTime = new Date(slotDateTime);
        const slotEndTime = new Date(slot.endTime);

        if (slot.isRecurring) {
          endDateTime.setHours(slotEndTime.getHours(), slotEndTime.getMinutes(), 0, 0);
        } else {
          endDateTime.setTime(new Date(slot.endTime).getTime());
        }

        availableSlots.push({
          id: slot.id,
          startTime: slotDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          isRecurring: slot.isRecurring,
        });
      }
    }

    // Ordenar por hora
    availableSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return NextResponse.json(availableSlots);

  } catch (error) {
    console.error('Error getting available slots:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
