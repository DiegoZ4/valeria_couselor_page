'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function Contacto() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsNavVisible(false);
        } else {
          setIsNavVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          to: 'santiagojoeljesus@gmail.com'
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al enviar el mensaje');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <Send className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 mb-4">
            ¡Mensaje Enviado!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu mensaje ha sido enviado correctamente. Te responderemos a la brevedad.
          </p>
          <div className="space-y-3">
            <Link 
              href="/" 
              className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Volver al inicio
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="block w-full text-indigo-600 hover:text-indigo-500"
            >
              Enviar otro mensaje
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-lg transition-transform duration-300 ${
        isNavVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Desktop Logo */}
            <div className="hidden md:flex items-center">
              <Link href="/" className="text-2xl font-bold font-heading text-indigo-600">Valeria Mariana Russo</Link>
              <span className="ml-2 text-gray-600 text-2xl">Counselor</span>
            </div>
            
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center flex-1">
              <Link href="/" className="flex flex-col">
                <span className="text-lg font-bold font-heading text-indigo-600">Valeria Mariana Russo</span>
                <span className="text-xs text-gray-600">Counselor</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                Inicio
              </Link>
              <Link href="/turnos" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                Solicitar Turno
              </Link>
              <Link href="/diplomas" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                Diplomas
              </Link>
              <Link href="/contacto" className="text-indigo-600 font-semibold px-3 py-2">
                Contacto
              </Link>
              <Link href="/auth/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Ingresar
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-indigo-600 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  href="/" 
                  className="block px-3 py-2 text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link 
                  href="/turnos" 
                  className="block px-3 py-2 text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Solicitar Turno
                </Link>
                <Link 
                  href="/diplomas" 
                  className="block px-3 py-2 text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Diplomas
                </Link>
                <Link 
                  href="/contacto" 
                  className="block px-3 py-2 text-indigo-600 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contacto
                </Link>
                <Link 
                  href="/auth/login" 
                  className="block mx-3 my-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ingresar
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Header Section */}
      <section className="py-12 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-4">
              Contacto
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Estoy aquí para ayudarte. No dudes en contactarme para cualquier consulta.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 mb-6">
                Información de Contacto
              </h2>
              
              <div className="space-y-6 py-3 mx-20">
                <div className="flex my-15 items-start">
                  <Phone className="h-6 w-6 text-indigo-600 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Teléfono</h3>
                    <p className="text-gray-600 text-lg">1144046476</p>
                    <p className="text-sm text-gray-500">Disponible durante horarios de atención</p>
                  </div>
                </div>
                
                <div className="flex my-15 items-start">
                  <Mail className="h-6 w-6 text-indigo-600 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Email</h3>
                    <p className="text-gray-600 text-lg">vale30278@hotmail.com</p>
                    <p className="text-sm text-gray-500">Respuesta en 24-48 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-indigo-600 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Ubicación</h3>
                    <p className="text-gray-600">Washington 6386</p>
                    <p className="text-gray-600">Isidro Casanova, Buenos Aires</p>
                    <p className="text-gray-600">Argentina</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 mb-6">
                Enviar Mensaje
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe tu consulta o motivo de contacto..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2025 Valeria Mariana Russo - Counselor. Todos los derechos reservados.</p>
            <p className="text-gray-400 mt-2">ESPSYC - Registro A-1327</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
