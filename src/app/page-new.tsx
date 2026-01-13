import { User, Clock, Award, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Valeria Russo</h1>
              <span className="ml-2 text-gray-600">Psicología</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                Inicio
              </Link>
              <Link href="/turnos" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                Solicitar Turno
              </Link>
              <Link href="/diplomas" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                Diplomas
              </Link>
              <Link href="/contacto" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                Contacto
              </Link>
              <Link href="/auth/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Bienvenido a mi Consultoría Psicológica
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Soy Valeria Russo, psicóloga especializada en terapia cognitivo-conductual. 
              Te acompaño en tu proceso de bienestar emocional con un enfoque profesional y empático.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/turnos" 
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Solicitar Turno
              </Link>
              <Link 
                href="/contacto" 
                className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Sobre Mí</h2>
              <p className="text-gray-600 mb-4">
                Con más de 10 años de experiencia en el campo de la psicología clínica, 
                me especializo en terapia cognitivo-conductual para adultos y adolescentes.
              </p>
              <p className="text-gray-600 mb-6">
                Mi enfoque se centra en brindar un espacio seguro y confidencial donde 
                puedas explorar tus pensamientos, emociones y comportamientos para 
                lograr un mayor bienestar emocional.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <User className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <p className="font-semibold">500+</p>
                  <p className="text-sm text-gray-600">Pacientes atendidos</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Clock className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <p className="font-semibold">10+</p>
                  <p className="text-sm text-gray-600">Años de experiencia</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Award className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <p className="font-semibold">5+</p>
                  <p className="text-sm text-gray-600">Especializaciones</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500">Foto profesional</p>
              {/* Aquí irá la imagen profesional */}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Servicios</h2>
            <p className="text-xl text-gray-600">Especialidades en las que puedo ayudarte</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Terapia Individual</h3>
              <p className="text-gray-600 mb-4">
                Sesiones personalizadas para abordar ansiedad, depresión, estrés y otros desafíos emocionales.
              </p>
              <ul className="text-sm text-gray-500">
                <li>• Ansiedad y ataques de pánico</li>
                <li>• Depresión</li>
                <li>• Estrés laboral</li>
                <li>• Autoestima</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Terapia de Pareja</h3>
              <p className="text-gray-600 mb-4">
                Trabajo conjunto para mejorar la comunicación y fortalecer la relación.
              </p>
              <ul className="text-sm text-gray-500">
                <li>• Comunicación efectiva</li>
                <li>• Resolución de conflictos</li>
                <li>• Intimidad emocional</li>
                <li>• Crisis de pareja</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Terapia Familiar</h3>
              <p className="text-gray-600 mb-4">
                Apoyo para familias que atraviesan momentos difíciles o cambios importantes.
              </p>
              <ul className="text-sm text-gray-500">
                <li>• Dinámicas familiares</li>
                <li>• Adolescentes conflictivos</li>
                <li>• Separaciones</li>
                <li>• Duelo familiar</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-xl opacity-90">Estoy aquí para acompañarte en tu proceso de bienestar</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Phone className="h-8 w-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Teléfono</h3>
              <p className="opacity-90">+54 11 1234-5678</p>
            </div>
            <div>
              <Mail className="h-8 w-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="opacity-90">valeria@psicologia.com</p>
            </div>
            <div>
              <MapPin className="h-8 w-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ubicación</h3>
              <p className="opacity-90">Buenos Aires, Argentina</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2025 Valeria Russo - Consultoría Psicológica. Todos los derechos reservados.</p>
            <p className="text-gray-400 mt-2">Matrícula Profesional: MP 12345</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
