'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

interface AvailableSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  details?: string;
}

export default function Turnos() {
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'calendar' | 'slots' | 'form' | 'success'>('calendar');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (isAuthenticated) {
      loadAvailableDates();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadAvailableDates = async () => {
    try {
      const response = await fetch('/api/sessions/available');
      if (response.ok) {
        const data = await response.json();
        setAvailableDates(data.availableDates || []);
      }
    } catch (error) {
      console.error('Error loading available dates:', error);
    }
  };

  const loadAvailableSlots = async (date: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions/available?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
        setStep('slots');
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      setError('Error al cargar los horarios disponibles');
    } finally {
      setIsLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!selectedSlot || !token) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: selectedSlot.id,
          details: details,
        }),
      });

      if (response.ok) {
        setStep('success');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al reservar el turno');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Error al reservar el turno');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isDateAvailable = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    return availableDates.includes(dateString) && date >= new Date();
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    loadAvailableSlots(dateString);
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation currentPage="turnos" />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Solicitar Turno</h1>
            <p className="text-lg text-gray-600">
              Selecciona una fecha y horario disponible para tu consulta
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center ${step === 'calendar' ? 'text-indigo-600' : step === 'slots' || step === 'form' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <Calendar className="h-6 w-6 mr-2" />
                <span className="font-medium">Seleccionar Fecha</span>
              </div>
              <div className={`flex items-center ${step === 'slots' ? 'text-indigo-600' : step === 'form' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <Clock className="h-6 w-6 mr-2" />
                <span className="font-medium">Seleccionar Horario</span>
              </div>
              <div className={`flex items-center ${step === 'form' ? 'text-indigo-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <User className="h-6 w-6 mr-2" />
                <span className="font-medium">Confirmar Turno</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Calendar Step */}
          {step === 'calendar' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day && (
                      <button
                        onClick={() => isDateAvailable(day) && handleDateSelect(day)}
                        disabled={!isDateAvailable(day)}
                        className={`w-full h-full flex items-center justify-center text-sm rounded-lg transition-colors ${
                          isDateAvailable(day)
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {day}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-indigo-100 rounded mr-2"></div>
                    <span>Días disponibles</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <span>No disponible</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Time Slots Step */}
          {step === 'slots' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Horarios disponibles para {selectedDate && formatDate(selectedDate)}
                </h2>
                <button
                  onClick={() => setStep('calendar')}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Cambiar fecha
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando horarios...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep('form');
                      }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </p>
                          <p className="text-sm text-gray-500">40 minutos</p>
                        </div>
                        <Clock className="h-5 w-5 text-indigo-600" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
                  <button
                    onClick={() => setStep('calendar')}
                    className="mt-4 text-indigo-600 hover:text-indigo-800"
                  >
                    Seleccionar otra fecha
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Confirmation Form Step */}
          {step === 'form' && selectedSlot && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Confirmar tu turno</h2>
              
              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-indigo-900 mb-2">Resumen del turno:</h3>
                <div className="space-y-1 text-indigo-800">
                  <p><strong>Fecha:</strong> {selectedDate && formatDate(selectedDate)}</p>
                  <p><strong>Horario:</strong> {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</p>
                  <p><strong>Duración:</strong> 40 minutos</p>
                  <p><strong>Modalidad:</strong> Virtual</p>
                  <p><strong>Costo:</strong> 20 Euros</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la consulta o detalles adicionales (opcional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Importante:</strong> Tu solicitud será revisada y confirmada por nuestro equipo. 
                  Recibirás un email de confirmación una vez que tu turno sea aprobado.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('slots')}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={bookAppointment}
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Confirmando...' : 'Confirmar Turno'}
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">¡Turno confirmado exitosamente!</h2>
              <p className="text-gray-600 mb-6">
                Tu turno ha sido confirmado automáticamente. 
                Recibirás un email de confirmación con todos los detalles en breve.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  <strong>¡Importante!</strong> Revisa tu bandeja de entrada y carpeta de spam para el email de confirmación.
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setStep('calendar');
                    setSelectedDate(null);
                    setSelectedSlot(null);
                    setDetails('');
                    setError('');
                  }}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Reservar otro turno
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
