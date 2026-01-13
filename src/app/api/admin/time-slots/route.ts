import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Middleware to verify admin access
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    if (decoded.role !== 'ADMIN') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: 'Acceso no autorizado' },
        { status: 401 }
      );
    }

    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: [
        { isRecurring: 'desc' },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ],
    });

    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: 'Acceso no autorizado' },
        { status: 401 }
      );
    }

    const { dayOfWeek, startTime, endTime, isRecurring } = await request.json();

    if (!startTime || !endTime) {
      return NextResponse.json(
        { message: 'Hora de inicio y fin son requeridas' },
        { status: 400 }
      );
    }

    if (isRecurring && (dayOfWeek === null || dayOfWeek === undefined)) {
      return NextResponse.json(
        { message: 'Día de la semana es requerido para horarios recurrentes' },
        { status: 400 }
      );
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        dayOfWeek: isRecurring ? dayOfWeek : null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isRecurring: isRecurring || false,
        isActive: true,
      },
    });

    return NextResponse.json(timeSlot, { status: 201 });
  } catch (error) {
    console.error('Error creating time slot:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
