'use client';

import { Award, GraduationCap, ExternalLink, MapPin, Calendar, FileText, School, Building, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../../components/Navigation';

export default function Diplomas() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation currentPage="diplomas" />

      {/* Header Section */}
      <section className="py-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6">
              Formación Profesional
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Credenciales y certificaciones que respaldan mi práctica profesional
            </p>
          </div>
        </div>
      </section>

      {/* Main Diploma Section */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Diploma Image */}
            <div className="order-2 lg:order-1">
              <div className="bg-gray-100 rounded-lg p-4 md:p-8 shadow-lg">
                <Image
                  src="/diploma.jpg"
                  alt="Diploma de Consultor Psicológico - ESPSYC"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg shadow-md"
                  priority
                />
              </div>
            </div>

            {/* Diploma Information */}
            <div className="order-1 lg:order-2">
              <div className="bg-indigo-50 rounded-lg p-6 md:p-8">
                <div className="flex items-center mb-6">
                  <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-indigo-600 mr-3" />
                  <h2 className="text-2xl md:text-3xl font-bold font-heading text-gray-900">Consultor Psicológico</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Institución</h3>
                      <p className="text-gray-600 text-sm md:text-base">Escuela Superior de Psicología Social (ESPSYC)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Fecha de Graduación</h3>
                      <p className="text-gray-600 text-sm md:text-base">Agosto 2024</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Duración del Programa</h3>
                      <p className="text-gray-600 text-sm md:text-base">3 años de formación especializada</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Validación Oficial</h3>
                      <p className="text-gray-600 text-sm md:text-base">Registro A-1327</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <a 
                    href="https://espsicosocial.com.ar/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
                  >
                    <ExternalLink className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Visitar ESPSYC
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institution Details */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 mb-4">Sobre ESPSYC</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              La Escuela Superior de Psicología Social es una institución reconocida 
              por su excelencia en la formación de profesionales en el campo de la psicología social.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <School className="h-8 w-8 md:h-10 md:w-10 text-indigo-600 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-3 text-black">Formación Especializada</h3>
              <p className="text-black text-sm md:text-base">
                Programa de 3 años enfocado en la consultoría psicológica con 
                enfoque social y comunitario.
              </p>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <Building className="h-8 w-8 md:h-10 md:w-10 text-indigo-600 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-3 text-black">Institución Reconocida</h3>
              <p className="text-black text-sm md:text-base">
                ESPSYC cuenta con reconocimiento oficial y forma parte del 
                sistema educativo argentino.
              </p>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg md:col-span-2 lg:col-span-1">
              <Shield className="h-8 w-8 md:h-10 md:w-10 text-indigo-600 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-3 text-black">Registro Profesional</h3>
              <p className="text-black text-sm md:text-base">
                Certificación oficial con registro A-1327 que avala la 
                práctica profesional en consultoría psicológica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 md:py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">¿Interesado en una consulta?</h2>
          <p className="text-lg md:text-xl opacity-90 mb-6 md:mb-8">
            Mi formación profesional me permite ofrecerte un acompañamiento integral y especializado.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:space-x-4">
            <Link 
              href="/turnos" 
              className="bg-white text-indigo-600 px-6 md:px-8 py-2 md:py-3 rounded-lg text-base md:text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Solicitar Turno
            </Link>
            <Link 
              href="/contacto" 
              className="border border-white text-white px-6 md:px-8 py-2 md:py-3 rounded-lg text-base md:text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Contactar
            </Link>
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
