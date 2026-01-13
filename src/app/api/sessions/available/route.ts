import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      // Get available sessions for a specific date
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);
      
      const sessions = await prisma.session.findMany({
        where: {
          status: 'PENDING',
          userId: undefined,
          startTime: {
            gte: selectedDate,
            lt: nextDay,
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      return NextResponse.json({ availableSlots: sessions });
    } else {
      // Get all available dates (dates that have PENDING sessions without users)
      const sessions = await prisma.session.findMany({
        where: {
          status: 'PENDING',
          userId: undefined,
          startTime: {
            gte: new Date(), // Only future sessions
          },
        },
        select: {
          startTime: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      // Extract unique dates
      const availableDates = Array.from(new Set(
        sessions.map(session => 
          session.startTime.toISOString().split('T')[0]
        )
      ));

      return NextResponse.json({ availableDates });
    }
  } catch (error) {
    console.error('Error fetching available sessions:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
