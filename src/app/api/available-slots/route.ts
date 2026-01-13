import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const createSlotSchema = z.object({
  isRecurring: z.boolean(),
  dayOfWeek: z.number().min(0).max(6).nullable(),
  startTime: z.string(),
  endTime: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const isAdminRequest = searchParams.get('admin') === 'true';

    // Check if this is an admin request
    if (isAdminRequest) {
      await requireAdmin(request);
      
      const slots = await prisma.timeSlot.findMany({
        orderBy: [
          { isRecurring: 'desc' },
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      });

      return NextResponse.json(slots);
    }

    // For patient requests, require authentication but not admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For public access (calendar view), don't require auth initially
      // We'll implement this once we have the basic flow working
    }

    if (date) {
      // Get available slots for a specific date
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();
      
      // Get recurring slots for this day of week
      const recurringSlots = await prisma.timeSlot.findMany({
        where: {
          isRecurring: true,
          dayOfWeek: dayOfWeek,
          isActive: true,
        },
      });

      // Get one-time slots for this specific date
      const oneTimeSlots = await prisma.timeSlot.findMany({
        where: {
          isRecurring: false,
          isActive: true,
          startTime: {
            gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
            lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
          },
        },
      });

      // Combine and format slots
      const allSlots = [...recurringSlots, ...oneTimeSlots];

      // Generate actual datetime slots for the selected date
      const availableSlots = allSlots.map(slot => {
        const startTime = new Date(slot.startTime);
        const endTime = new Date(slot.endTime);
        
        if (slot.isRecurring) {
          // For recurring slots, set the date to the selected date
          const slotStart = new Date(selectedDate);
          slotStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
          
          const slotEnd = new Date(selectedDate);
          slotEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
          
          return {
            id: `${slot.id}-${date}`,
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            isRecurring: slot.isRecurring,
            dayOfWeek: slot.dayOfWeek,
          };
        } else {
          return {
            id: slot.id,
            startTime: slot.startTime.toISOString(),
            endTime: slot.endTime.toISOString(),
            isRecurring: slot.isRecurring,
            dayOfWeek: slot.dayOfWeek,
          };
        }
      });

      // Filter out slots that are already booked
      const bookedSessions = await prisma.session.findMany({
        where: {
          startTime: {
            gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
            lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
          },
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
        },
      });

      const availableSlotsFiltered = availableSlots.filter(slot => {
        return !bookedSessions.some(session => {
          const sessionStart = new Date(session.startTime).getTime();
          const slotStart = new Date(slot.startTime).getTime();
          return Math.abs(sessionStart - slotStart) < 60000; // Within 1 minute
        });
      });

      return NextResponse.json({ availableSlots: availableSlotsFiltered });
    } else {
      // Get all available dates (next 60 days)
      const today = new Date();
      const availableDates = [];
      
      // Get all recurring slots
      const recurringSlots = await prisma.timeSlot.findMany({
        where: {
          isRecurring: true,
          isActive: true,
        },
      });

      // Get all one-time slots in the next 60 days
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 60);
      
      const oneTimeSlots = await prisma.timeSlot.findMany({
        where: {
          isRecurring: false,
          isActive: true,
          startTime: {
            gte: today,
            lte: futureDate,
          },
        },
      });

      // Generate available dates based on recurring slots
      for (let i = 0; i < 60; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dayOfWeek = checkDate.getDay();
        
        // Check if there are recurring slots for this day
        const hasRecurringSlots = recurringSlots.some(slot => slot.dayOfWeek === dayOfWeek);
        
        // Check if there are one-time slots for this date
        const hasOneTimeSlots = oneTimeSlots.some(slot => {
          const slotDate = new Date(slot.startTime);
          return slotDate.toDateString() === checkDate.toDateString();
        });

        if (hasRecurringSlots || hasOneTimeSlots) {
          availableDates.push(checkDate.toISOString().split('T')[0]);
        }
      }

      return NextResponse.json({ availableDates });
    }

  } catch (error) {
    console.error('Error fetching slots:', error);

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

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();

    const validatedData = createSlotSchema.parse(body);

    // Validar que si es recurrente, tiene dayOfWeek
    if (validatedData.isRecurring && validatedData.dayOfWeek === null) {
      return NextResponse.json(
        { message: 'El día de la semana es requerido para horarios recurrentes' },
        { status: 400 }
      );
    }

    // Validar que si no es recurrente, no tiene dayOfWeek
    if (!validatedData.isRecurring && validatedData.dayOfWeek !== null) {
      return NextResponse.json(
        { message: 'El día de la semana no debe especificarse para horarios únicos' },
        { status: 400 }
      );
    }

    const slot = await prisma.timeSlot.create({
      data: {
        isRecurring: validatedData.isRecurring,
        dayOfWeek: validatedData.dayOfWeek,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        isActive: true,
      },
    });

    return NextResponse.json(slot, { status: 201 });

  } catch (error) {
    console.error('Error creating slot:', error);

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
