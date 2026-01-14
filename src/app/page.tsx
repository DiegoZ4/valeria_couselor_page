'use client';

import { User, Clock, Award, Heart, Lightbulb, Users, UserCheck, Search, HelpCircle, HandHeart, Euro, CreditCard, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/caruzel1.png',
      title: 'Consultoría Psicológica',
      subtitle: '',
      description: '',
      buttons: []
    },
    {
      image: '/caruzel2.png',
      title: 'Un espacio de escucha y crecimiento personal',
      subtitle: '',
      description: '',
      buttons: []
    },
    {
      image: '/caruzel3.png',
      title: 'Despliegue de potencialidades',
      subtitle: '',
      description: '',
      buttons: [
        { text: 'Solicitar Turno', href: '/turnos', primary: true }
      ]
    },
    {
      image: '/caruzel4.png',
      title: 'Un espacio de apoyo y acompañamiento profesional a tu alcance',
      subtitle: '',
      description: '',
      buttons: [
        { text: 'Contactar', href: '/contacto', primary: false }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds for better readability

    return () => clearInterval(interval);
  }, [slides.length]);

  // Add scroll parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-bg');
      
      parallaxElements.forEach((element) => {
        const rate = scrolled * 0.7; // Imagen va hacia abajo más rápido que el scroll
        (element as HTMLElement).style.transform = `translateY(${rate}px)`;
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation currentPage="home" />

      {/* Hero Carousel Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="relative w-full h-full">
          {/* Background Images with Parallax */}
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 slide-transition ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div 
                className="absolute inset-0 carousel-bg parallax-bg"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: `translateY(${(index === currentSlide ? 0 : 20)}px) scale(${index === currentSlide ? 1.1 : 1.15})`,
                  top: '-10vh',
                  height: '120vh'
                }}
              />
              <div className="absolute inset-0 gradient-overlay" />
            </div>
          ))}

          {/* Content Overlay */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
              <div className="transition-all duration-1000 ease-in-out">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-heading mb-6 drop-shadow-2xl leading-tight text-shadow-lg">
                  {slides[currentSlide].title}
                </h1>
                
                {slides[currentSlide].subtitle && (
                  <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold font-heading text-indigo-200 mb-6 drop-shadow-xl">
                    {slides[currentSlide].subtitle}
                  </h2>
                )}
                
                {slides[currentSlide].description && (
                  <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-4xl mx-auto drop-shadow-lg leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                )}
                
                {slides[currentSlide].buttons.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    {slides[currentSlide].buttons.map((button, btnIndex) => (
                      <Link 
                        key={btnIndex}
                        href={button.href} 
                        className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl ${
                          button.primary 
                            ? 'border-2 border-white text-white hover:bg-white hover:text-gray-900 hover:shadow-white/25' 
                            : 'border-2 border-white text-white hover:bg-white hover:text-gray-900 hover:shadow-white/25'
                        }`}
                      >
                        {button.text}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 carousel-arrow bg-white/20 hover:bg-white/30 text-white p-3 md:p-4 rounded-full transition-all duration-300"
          >
            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 carousel-arrow bg-white/20 hover:bg-white/30 text-white p-3 md:p-4 rounded-full transition-all duration-300"
          >
            <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex space-x-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`carousel-dot w-4 h-4 md:w-5 md:h-5 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125 shadow-lg' 
                    : 'bg-white/50 hover:bg-white/75 hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-heading text-gray-900 mb-6">Sobre Mí</h2>
              <p className="text-indigo-700 mb-4 text-lg">
                Bienvenid@ a mi espacio de consulta y apoyo profesional. Soy Valeria Mariana Russo, Counselor, consultora psicológica con experiencia en el campo. Mi enfoque se basa en la psicología humanista de Carl Rogers, que prioriza la creación de un ambiente seguro y dónde se pueda generar un vínculo sanante. Mi objetivo es ofrecer un espacio de escucha activa, donde puedas sentirte escuchado, validado y comprendido.
              </p>
              <p className="text-indigo-700 mb-6 text-lg">
                He trabajado con más de 50 personas, parejas y familias, ayudándolos a superar desafíos emocionales y psicológicos. Mi compromiso es derivar a los profesionales adecuados cuando sea necesario. Estoy aquí para escucharte y apoyarte en tu camino hacia el crecimiento y la sanación. ¡Bienvenid@!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Heart className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <p className="font-semibold text-black">Humanista</p>
                  <p className="text-sm text-gray-600">Enfoque Carl Rogers</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Award className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <p className="font-semibold text-black">ESPSYC</p>
                  <p className="text-sm text-gray-600">Certificación A-1327</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/valeria-foto.jpg"
                alt="Valeria Mariana Russo - Counselor Profesional"
                width={600}
                height={600}
                className="w-full h-96 object-cover"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <p className="text-white text-xl font-semibold">Valeria Mariana Russo</p>
                <p className="text-white/90 text-lg">Counselor Profesional</p>
                <p className="text-white/80 text-sm mt-1">ESPSYC - Registro A-1327</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4">Servicios</h2>
            <p className="text-xl text-gray-600">
              Te ofrezco un espacio de escucha y crecimiento personal. En dónde podamos buscar el despliegue de tus potencialidades!
            </p>
            <p className="text-lg text-gray-600 mt-2">
              Un espacio de apoyo y acompañamiento profesional a tu alcance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Ansiedad */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 mr-3 text-red-500" />
                <h3 className="text-xl font-semibold font-heading text-gray-900">Ansiedad</h3>
              </div>
              <p className="text-gray-600 mb-4">
                ¿Sientes que la ansiedad te limita? Puedo ayudarte con herramientas prácticas a encontrar la calma y el control.
              </p>
            </div>

            {/* Duelo */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 mr-3 text-purple-500" />
                <h3 className="text-xl font-semibold font-heading text-gray-900">Duelo</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Si estás pasando por un proceso de duelo estaré a tu lado ofreciéndote acompañamiento en un espacio seguro para sanar y honrar la memoria.
              </p>
            </div>

            {/* Angustia */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center mb-4">
                <HelpCircle className="h-6 w-6 mr-3 text-orange-500" />
                <h3 className="text-xl font-semibold font-heading text-gray-900">Angustia</h3>
              </div>
              <p className="text-gray-600 mb-4">
                En casos en que la angustia te esté atravesando podré ayudarte a manejarla y recuperar tu tranquilidad interior.
              </p>
            </div>

            {/* Búsqueda Personal */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-6 w-6 mr-3 text-green-500" />
                <h3 className="text-xl font-semibold font-heading text-gray-900">Búsqueda Personal</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Descubre tu potencial y construye la vida que deseas.
              </p>
              <p className="text-gray-600 mb-4">
                ¿Estás en búsqueda de un cambio? Te puedo acompañar en tu proceso de realización personal.
              </p>
            </div>

            {/* Autoexploración */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <Search className="h-6 w-6 mr-3 text-blue-500" />
                <h3 className="text-xl font-semibold font-heading text-gray-900">Autoexploración</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Empezá a vivir con propósito y autoconocimiento.
              </p>
              <p className="text-gray-600 mb-4">
                Te acompaño en tu autoexploración, podré alumbrarte el camino y ayudarte a encontrar las herramientas.
              </p>
            </div>

            {/* Adolescentes */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center mb-4">
                <UserCheck className="h-6 w-6 mr-3 text-yellow-500" />
                <h3 className="text-xl font-semibold font-heading text-gray-900">Adolescentes</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Apoyo para adolescentes y sus familias en una etapa de grandes cambios.
              </p>
            </div>

            {/* Adultos Mayores */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-indigo-500">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 mr-3 text-indigo-500" />
                <h3 className="text-xl font-semibold font-heading text-gray-900">Adultos Mayores</h3>
              </div>
              <p className="text-gray-600 mb-4">
                También si tienes entre 60 y 80 años podés contar con un espacio de escucha para adultos que buscan bienestar emocional y nuevos desafíos. Soy Acompañante Terapéutica y tengo experiencia en adultos mayores.
              </p>
            </div>

            {/* Pareja y Familia */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-pink-500">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 mr-3 text-pink-500" />
                <h3 className="text-xl font-semibold font-heading text-gray-900">Pareja y Familia</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Acompañamiento a parejas en búsqueda de mejorar su comunicación y fortalecer el vínculo en su relación.
              </p>
              <p className="text-gray-600 mb-4">
                La terapia de pareja y familia es un camino para superar conflictos y reconectar.
              </p>
            </div>

            {/* Adicciones */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-600">
              <div className="flex items-center mb-4">
                <HandHeart className="h-6 w-6 mr-3 text-red-600" />
                <h3 className="text-xl font-semibold font-heading text-gray-900">Adicciones</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Operadora socio-terapéutica en adicciones: un sostén profesional y empático para ti y tu familia.
              </p>
              <p className="text-gray-600 mb-4">
                Acompañamiento en adicciones: el primer paso hacia una recuperación duradera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading mb-4">Agenda tu primera consulta virtual hoy mismo</h2>
            <p className="text-xl opacity-90 mb-6">Te invito a comenzar tu proceso de bienestar. Hablemos.</p>
            <p className="text-lg opacity-90">Estoy aquí para escucharte. Contáctame para más información.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center mb-8">
            <div className="bg-white h-40 bg-opacity-10 rounded-lg p-6">
              <Clock className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-black">Horarios</h3>
              <p className="opacity-90 text-gray-600 text-sm">15:00 o 16:00 España</p>
              <p className="opacity-90 text-gray-600 text-sm">18:00, 19:00 o 20:00</p>
            </div>
            
            <div className="bg-white h-40 bg-opacity-10 rounded-lg p-6">
              <Euro className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-black">Precio</h3>
              <p className="opacity-90 text-gray-600 text-sm font-bold">20 Euros</p>
              <p className="opacity-90 text-gray-600 text-sm">Sesión de 40 minutos</p>
            </div>
            
            <div className="bg-white h-40 bg-opacity-10 rounded-lg p-6">
              <CreditCard className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-black">Pago</h3>
              <p className="opacity-90 text-gray-600">PayPal</p>
            </div>
            
            <div className="bg-white h-40 bg-opacity-10 rounded-lg p-6">
              <Monitor className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold text-black mb-2 ">Modalidad</h3>
              <p className="opacity-90 text-gray-600">Virtual</p>
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
