'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Plus, Users, Edit, Eye, Trash2, Settings } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

interface TimeSlot {
  id: string;
  dayOfWeek: number | null;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  isActive: boolean;
}

interface Session {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  details?: string;
  observations?: string;
}

export default function AdminDashboard() {
  const { isAdmin, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'slots'>('sessions');

  // Form states for new session
  const [newSession, setNewSession] = useState({
    startTime: '',
    endTime: '',
    details: ''
  });

  // Auto-calculate end time when start time changes
  const handleStartTimeChange = (startTime: string) => {
    if (startTime) {
      const startDate = new Date(startTime);
      const endDate = new Date(startDate.getTime() + 40 * 60 * 1000); // Add 40 minutes
      
      // Format for datetime-local input (YYYY-MM-DDTHH:mm)
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');
      const hours = String(endDate.getHours()).padStart(2, '0');
      const minutes = String(endDate.getMinutes()).padStart(2, '0');
      const endTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      setNewSession({
        ...newSession,
        startTime,
        endTime: endTimeString
      });
    } else {
      setNewSession({
        ...newSession,
        startTime,
        endTime: ''
      });
    }
  };

  // Form states for new time slot
  const [newSlot, setNewSlot] = useState({
    isRecurring: false,
    dayOfWeek: null as number | null,
    startTime: '',
    endTime: '',
  });

  const loadData = useCallback(async () => {
    if (!token) return;
    
    try {
      // Load sessions
      const sessionsResponse = await fetch('/api/admin/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      } else {
        console.error('Error loading sessions');
      }

      // Load time slots
      const slotsResponse = await fetch('/api/available-slots?admin=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (slotsResponse.ok) {
        const slotsData = await slotsResponse.json();
        setTimeSlots(slotsData);
      } else {
        console.error('Error loading time slots');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (!authLoading && !isAdmin) {
      router.push('/');
      return;
    }
    
    if (isAdmin && token) {
      loadData();
    }
  }, [isAdmin, isAuthenticated, authLoading, token, router, loadData]);

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          startTime: newSession.startTime,
          endTime: newSession.endTime,
          details: newSession.details,
          status: 'PENDING'
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewSession({
          startTime: '',
          endTime: '',
          details: ''
        });
        loadData();
        alert('Sesión creada exitosamente');
      } else {
        const errorData = await response.json();
        alert(`Error al crear la sesión: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error al crear la sesión');
    }
  };

  const updateSessionStatus = async (sessionId: string, status: string, observations?: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, observations }),
      });

      if (response.ok) {
        loadData();
        setShowUpdateModal(false);
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const createTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      let startTime, endTime;
      
      if (newSlot.isRecurring) {
        // For recurring slots, create a base date with the time
        const today = new Date();
        const [hours, minutes] = newSlot.startTime.split(':').map(Number);
        const [endHours, endMinutes] = newSlot.endTime.split(':').map(Number);
        
        startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
        endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHours, endMinutes);
      } else {
        // For one-time slots, use the full datetime
        startTime = new Date(newSlot.startTime);
        endTime = new Date(newSlot.endTime);
      }

      const response = await fetch('/api/available-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isRecurring: newSlot.isRecurring,
          dayOfWeek: newSlot.dayOfWeek,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (response.ok) {
        setShowSlotModal(false);
        setNewSlot({
          isRecurring: false,
          dayOfWeek: null,
          startTime: '',
          endTime: '',
        });
        loadData();
        alert('Horario creado exitosamente');
      } else {
        const errorData = await response.json();
        alert(`Error al crear el horario: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating time slot:', error);
      alert('Error al crear el horario');
    }
  };

  const deleteTimeSlot = async (slotId: string) => {
    if (!token || !confirm('¿Está seguro de que desea eliminar este horario?')) return;

    try {
      const response = await fetch(`/api/available-slots/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadData();
        alert('Horario eliminado exitosamente');
      } else {
        alert('Error al eliminar el horario');
      }
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert('Error al eliminar el horario');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'COMPLETED':
        return 'Completado';
      default:
        return status;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation currentPage="admin" />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-20">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Sesiones
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {sessions.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pendientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {sessions.filter(s => s.status === 'PENDING').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Confirmadas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {sessions.filter(s => s.status === 'CONFIRMED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completadas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {sessions.filter(s => s.status === 'COMPLETED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sessions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="h-5 w-5 mr-2 inline" />
                Sesiones
              </button>
              <button
                onClick={() => setActiveTab('slots')}
                className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'slots'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="h-5 w-5 mr-2 inline" />
                Horarios Disponibles
              </button>
            </nav>
          </div>
        </div>

        {/* Sessions Table */}
        {activeTab === 'sessions' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Sesiones
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Administra todas las sesiones y turnos
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Sesión
            </button>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <li key={session.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {session.user ? `${session.user.firstName} ${session.user.lastName}` : 'Sin asignar'}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {getStatusText(session.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(session.startTime).toLocaleDateString('es-AR')} - {' '}
                        {new Date(session.startTime).toLocaleTimeString('es-AR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} a {' '}
                        {new Date(session.endTime).toLocaleTimeString('es-AR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      {session.user && (
                        <p className="text-sm text-gray-500">{session.user.email}</p>
                      )}
                      {session.details && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Detalles:</strong> {session.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setShowUpdateModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        )}

        {/* Time Slots Table */}
        {activeTab === 'slots' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Horarios Disponibles
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Administra los horarios disponibles para reservas
              </p>
            </div>
            <button 
              onClick={() => setShowSlotModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Horario
            </button>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {timeSlots.map((slot) => (
              <li key={slot.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {slot.isRecurring ? 'Horario Recurrente' : 'Horario Único'}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          slot.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {slot.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {slot.isRecurring ? (
                          `Todos los ${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][slot.dayOfWeek || 0]}`
                        ) : (
                          new Date(slot.startTime).toLocaleDateString('es-ES')
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(slot.startTime).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {' '}
                        {new Date(slot.endTime).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteTimeSlot(slot.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Actualizar Sesión
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Paciente:</strong> {selectedSession.user ? `${selectedSession.user.firstName} ${selectedSession.user.lastName}` : 'Sin asignar'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong> {new Date(selectedSession.startTime).toLocaleString('es-AR')}
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => updateSessionStatus(selectedSession.id, 'CONFIRMED')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => updateSessionStatus(selectedSession.id, 'CANCELLED')}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => updateSessionStatus(selectedSession.id, 'COMPLETED')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Marcar como Completada
                </button>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Crear Nueva Sesión
              </h3>
              <form onSubmit={createSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora de Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={newSession.startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    La sesión durará 40 minutos automáticamente
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora de Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={newSession.endTime}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-900 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Se calcula automáticamente (+40 minutos)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalles (opcional)
                  </label>
                  <textarea
                    value={newSession.details}
                    onChange={(e) => setNewSession({...newSession, details: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
                  >
                    Crear Sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Time Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Crear Nuevo Horario
              </h3>
              <form onSubmit={createTimeSlot} className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSlot.isRecurring}
                      onChange={(e) => setNewSlot({...newSlot, isRecurring: e.target.checked, dayOfWeek: e.target.checked ? 1 : null})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Horario recurrente (semanal)
                    </span>
                  </label>
                </div>

                {newSlot.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Día de la semana
                    </label>
                    <select
                      value={newSlot.dayOfWeek || ''}
                      onChange={(e) => setNewSlot({...newSlot, dayOfWeek: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Seleccionar día</option>
                      <option value="0">Domingo</option>
                      <option value="1">Lunes</option>
                      <option value="2">Martes</option>
                      <option value="3">Miércoles</option>
                      <option value="4">Jueves</option>
                      <option value="5">Viernes</option>
                      <option value="6">Sábado</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newSlot.isRecurring ? 'Hora de Inicio' : 'Fecha y Hora de Inicio'}
                  </label>
                  <input
                    type={newSlot.isRecurring ? "time" : "datetime-local"}
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newSlot.isRecurring ? 'Hora de Fin' : 'Fecha y Hora de Fin'}
                  </label>
                  <input
                    type={newSlot.isRecurring ? "time" : "datetime-local"}
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
                  >
                    Crear Horario
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSlotModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
