import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sessionSchema } from '../../../../lib/validations';
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

    const sessions = await prisma.session.findMany({
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
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
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

    const requestData = await request.json();
    const { userId, startTime, endTime, details, status } = requestData;

    // Validate the session data
    try {
      sessionSchema.parse({ startTime, endTime, details });
    } catch (validationError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: validationError },
        { status: 400 }
      );
    }

    // Calculate endTime if not provided (40 minutes after startTime)
    const calculatedEndTime = endTime || new Date(new Date(startTime).getTime() + 40 * 60 * 1000).toISOString();

    // Check if the requested time slot is available
    const existingSession = await prisma.session.findFirst({
      where: {
        AND: [
          {
            OR: [
              {
                AND: [
                  { startTime: { lte: new Date(startTime) } },
                  { endTime: { gt: new Date(startTime) } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: new Date(calculatedEndTime) } },
                  { endTime: { gte: new Date(calculatedEndTime) } }
                ]
              },
              {
                AND: [
                  { startTime: { gte: new Date(startTime) } },
                  { endTime: { lte: new Date(calculatedEndTime) } }
                ]
              }
            ]
          },
          { status: { not: 'CANCELLED' } }
        ]
      }
    });

    if (existingSession) {
      return NextResponse.json(
        { message: 'El horario seleccionado no está disponible' },
        { status: 409 }
      );
    }

    const session = await prisma.session.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(calculatedEndTime),
        userId: userId || null,
        details: details || null,
        status: status || 'PENDING',
      },
      include: {
        user: userId ? {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        } : false,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
