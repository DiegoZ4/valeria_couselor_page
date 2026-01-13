'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Users, Settings } from 'lucide-react';
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

export default function AdminPanel() {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sessions' | 'slots'>('sessions');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    isRecurring: false,
    date: ''
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (!isLoading && !isAdmin) {
      router.push('/');
      return;
    }
    
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, isAuthenticated, isLoading, router]);

  const loadData = async () => {
    try {
      const [sessionsRes, slotsRes] = await Promise.all([
        fetch('/api/admin/sessions'),
        fetch('/api/admin/time-slots')
      ]);
      
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
      }
      
      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setTimeSlots(slotsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slotData = {
        dayOfWeek: newSlot.isRecurring ? parseInt(newSlot.dayOfWeek) : null,
        startTime: newSlot.isRecurring 
          ? `2024-01-01T${newSlot.startTime}:00.000Z`
          : `${newSlot.date}T${newSlot.startTime}:00.000Z`,
        endTime: newSlot.isRecurring 
          ? `2024-01-01T${newSlot.endTime}:00.000Z`
          : `${newSlot.date}T${newSlot.endTime}:00.000Z`,
        isRecurring: newSlot.isRecurring
      };

      const response = await fetch('/api/admin/time-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slotData),
      });

      if (response.ok) {
        setShowCreateSlot(false);
        setNewSlot({
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          isRecurring: false,
          date: ''
        });
        loadData();
      }
    } catch (error) {
      console.error('Error creating slot:', error);
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayNumber];
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="admin" />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600 mt-2">Gestiona sesiones y horarios disponibles</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sessions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="inline-block w-4 h-4 mr-2" />
                Sesiones
              </button>
              <button
                onClick={() => setActiveTab('slots')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'slots'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="inline-block w-4 h-4 mr-2" />
                Horarios Disponibles
              </button>
            </nav>
          </div>

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Sesiones Programadas</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {session.user.firstName} {session.user.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(session.startTime).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(session.startTime).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(session.endTime).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            session.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {session.status === 'CONFIRMED' ? 'Confirmada' :
                             session.status === 'PENDING' ? 'Pendiente' : 'Cancelada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{session.user.email}</div>
                          {session.user.phone && <div>{session.user.phone}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Time Slots Tab */}
          {activeTab === 'slots' && (
            <div className="space-y-6">
              {/* Create Slot Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateSlot(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Horario
                </button>
              </div>

              {/* Create Slot Form */}
              {showCreateSlot && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Crear Nuevo Horario</h3>
                  <form onSubmit={handleCreateSlot} className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newSlot.isRecurring}
                          onChange={(e) => setNewSlot({...newSlot, isRecurring: e.target.checked})}
                          className="mr-2"
                        />
                        Horario recurrente (semanal)
                      </label>
                    </div>

                    {newSlot.isRecurring ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Día de la semana</label>
                        <select
                          value={newSlot.dayOfWeek}
                          onChange={(e) => setNewSlot({...newSlot, dayOfWeek: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        >
                          <option value="">Seleccionar día</option>
                          <option value="1">Lunes</option>
                          <option value="2">Martes</option>
                          <option value="3">Miércoles</option>
                          <option value="4">Jueves</option>
                          <option value="5">Viernes</option>
                          <option value="6">Sábado</option>
                          <option value="0">Domingo</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha específica</label>
                        <input
                          type="date"
                          value={newSlot.date}
                          onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora de inicio</label>
                        <input
                          type="time"
                          value={newSlot.startTime}
                          onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora de fin</label>
                        <input
                          type="time"
                          value={newSlot.endTime}
                          onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateSlot(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Crear Horario
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Time Slots List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Horarios Disponibles</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {timeSlots.map((slot) => (
                    <div key={slot.id} className="px-6 py-4 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {slot.isRecurring && slot.dayOfWeek !== null
                            ? `Cada ${getDayName(slot.dayOfWeek)}`
                            : new Date(slot.startTime).toLocaleDateString('es-ES')
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(slot.startTime).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(slot.endTime).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          slot.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {slot.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {slot.isRecurring ? 'Recurrente' : 'Único'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
