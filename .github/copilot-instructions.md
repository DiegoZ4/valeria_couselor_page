# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a Next.js application for psychological counseling services for Valeria Mariana Russo (Counselor). The application includes:

- **Frontend**: Next.js with TypeScript, Tailwind CSS, and App Router
- **Authentication**: JWT tokens with refresh token functionality
- **Database**: TypeScript entities for Users and Sessions
- **Email System**: Automated email notifications for appointments
- **Admin Panel**: Session management system for administrators

## Business Information

- **Professional Name**: Valeria Mariana Russo
- **Title**: Counselor
- **Tagline**: "Un espacio de escucha y crecimiento personal. Despliegue de potencialidades"
- **Services**: Virtual psychological counseling, therapy for anxiety, grief support, adolescent and family therapy, couples therapy, addiction support
- **Schedule**: 15:00-16:00 Spain time or 18:00-20:00
- **Price**: 20 Euros per 40-minute session via PayPal

## Architecture Guidelines

### Database Entities

- **User**: Contains user information, authentication data, and role management
- **Session**: Contains appointment data with start/end times, user references, observations, and details
- **AvailableSlot**: Admin-created time slots that can be recurring or one-time

### Authentication

- Implement JWT tokens with refresh token mechanism
- Role-based access control (admin/patient)
- Secure token storage and validation
- **IMPORTANT**: Users must be logged in to request appointments

### Pages Structure

- Home page with counseling information using provided content
- Contact page
- Appointment booking system (requires authentication, shows only admin-created slots)
- Single diploma/certificate display section
- Admin panel for session and time slot management

### Appointment System

- Users can only book from admin-created time slots
- Calendar view showing available dates
- Side panel showing available times for selected date
- Admin can create recurring slots (e.g., every Monday at 6 PM) or one-time slots
- Only authenticated users can access booking

### Email Integration

- Send notifications to administrators about new appointments
- Send confirmations to patients
- Automated reminder system

## Content Guidelines

Use "Counselor" instead of "Consultoría Psicológica" throughout the application.
Use the provided service descriptions and messaging in the home page.

## Coding Standards

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Implement responsive design with Tailwind CSS
- Use server components where appropriate
- Implement proper error handling and validation
