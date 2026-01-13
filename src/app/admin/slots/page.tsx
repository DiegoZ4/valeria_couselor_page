'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, RotateCcw, X } from 'lucide-react';
import Link from 'next/link';

interface AvailableSlot {
  id: string;
  dayOfWeek: number | null;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  isActive: boolean;
}

export default function ManageSlots() {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailableSlot | null>(null);
  const [formData, setFormData] = useState({
    isRecurring: false,
    dayOfWeek: '',
    date: '',
    startTime: '',
    endTime: '',
  });

  const daysOfWeek = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/available-slots', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSlots(data);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingSlot ? `/api/available-slots/${editingSlot.id}` : '/api/available-slots';
      const method = editingSlot ? 'PATCH' : 'POST';
      
      const body = {
        isRecurring: formData.isRecurring,
        dayOfWeek: formData.isRecurring ? parseInt(formData.dayOfWeek) : null,
        startTime: formData.isRecurring 
          ? `2024-01-01T${formData.startTime}:00.000Z`
          : `${formData.date}T${formData.startTime}:00.000Z`,
        endTime: formData.isRecurring 
          ? `2024-01-01T${formData.endTime}:00.000Z`
          : `${formData.date}T${formData.endTime}:00.000Z`,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        loadSlots();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving slot:', error);
    }
  };

  const deleteSlot = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/available-slots/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        loadSlots();
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const openModal = (slot?: AvailableSlot) => {
    if (slot) {
      setEditingSlot(slot);
      const startTime = new Date(slot.startTime);
      const endTime = new Date(slot.endTime);
      
      setFormData({
        isRecurring: slot.isRecurring,
        dayOfWeek: slot.dayOfWeek?.toString() || '',
        date: slot.isRecurring ? '' : startTime.toISOString().split('T')[0],
        startTime: startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
      });
    } else {
      setEditingSlot(null);
      setFormData({
        isRecurring: false,
        dayOfWeek: '',
        date: '',
        startTime: '',
        endTime: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlot(null);
  };

  if (isLoading) {
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
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">
                ← Volver al Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Gestionar Horarios Disponibles</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Horarios Disponibles
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Administra los horarios disponibles para que los pacientes puedan reservar
              </p>
            </div>
            <button 
              onClick={() => openModal()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Horario
            </button>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {slots.map((slot) => (
              <li key={slot.id} className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {slot.isRecurring ? (
                      <RotateCcw className="h-10 w-10 text-blue-400" />
                    ) : (
                      <Calendar className="h-10 w-10 text-green-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {slot.isRecurring ? (
                          `Todos los ${daysOfWeek[slot.dayOfWeek!]}`
                        ) : (
                          new Date(slot.startTime).toLocaleDateString('es-AR')
                        )}
                      </p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        slot.isRecurring 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {slot.isRecurring ? 'Recurrente' : 'Una vez'}
                      </span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        slot.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {slot.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {new Date(slot.startTime).toLocaleTimeString('es-AR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {new Date(slot.endTime).toLocaleTimeString('es-AR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openModal(slot)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteSlot(slot.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSlot ? 'Editar Horario' : 'Nuevo Horario'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="mr-2"
                  />
                  Horario recurrente (se repite cada semana)
                </label>
              </div>

              {formData.isRecurring ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Día de la semana
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Seleccionar día</option>
                    {daysOfWeek.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha específica
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
                >
                  {editingSlot ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
