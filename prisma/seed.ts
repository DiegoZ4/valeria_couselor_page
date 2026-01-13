import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@valeria-russo.com' },
    update: {},
    create: {
      email: 'admin@valeria-russo.com',
      password: hashedPassword,
      firstName: 'Valeria',
      lastName: 'Russo',
      phone: '+54 11 1234-5678',
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', admin);

  // Crear usuario de prueba (paciente)
  const patientPassword = await bcrypt.hash('patient123', 12);

  const patient = await prisma.user.upsert({
    where: { email: 'paciente@test.com' },
    update: {},
    create: {
      email: 'paciente@test.com',
      password: patientPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+54 11 9876-5432',
      role: 'PATIENT',
    },
  });

  console.log('Patient user created:', patient);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
