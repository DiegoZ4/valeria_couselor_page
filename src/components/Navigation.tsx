'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  currentPage?: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isAuthenticated, isAdmin, logout, isLoading } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Don't render auth-dependent content until mounted
  if (!isMounted) {
    return (
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-lg transition-transform duration-300 ${
        isNavVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Desktop Logo */}
            <div className="hidden md:flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">Valeria Mariana Russo</Link>
              <span className="ml-2 text-gray-600">Counselor</span>
            </div>
            
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center flex-1">
              <Link href="/" className="flex flex-col">
                <span className="text-lg font-bold text-indigo-600">Valeria Mariana Russo</span>
                <span className="text-xs text-gray-600">Counselor</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/" 
                className={`px-3 py-2 ${currentPage === 'home' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
              >
                Inicio
              </Link>
              <Link 
                href="/turnos" 
                className={`px-3 py-2 ${currentPage === 'turnos' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
              >
                Solicitar Turno
              </Link>
              <Link 
                href="/diplomas" 
                className={`px-3 py-2 ${currentPage === 'diplomas' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
              >
                Diplomas
              </Link>
              <Link 
                href="/contacto" 
                className={`px-3 py-2 ${currentPage === 'contacto' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
              >
                Contacto
              </Link>
              
              {/* Placeholder for auth content */}
              <div className="w-20 h-10"></div>
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
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-lg transition-transform duration-300 ${
      isNavVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Desktop Logo */}
          <div className="hidden md:flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">Valeria Mariana Russo</Link>
            <span className="ml-2 text-gray-600">Counselor</span>
          </div>
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center flex-1">
            <Link href="/" className="flex flex-col">
              <span className="text-lg font-bold text-indigo-600">Valeria Mariana Russo</span>
              <span className="text-xs text-gray-600">Counselor</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 ${currentPage === 'home' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              Inicio
            </Link>
            <Link 
              href="/turnos" 
              className={`px-3 py-2 ${currentPage === 'turnos' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              Solicitar Turno
            </Link>
            <Link 
              href="/diplomas" 
              className={`px-3 py-2 ${currentPage === 'diplomas' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              Diplomas
            </Link>
            <Link 
              href="/contacto" 
              className={`px-3 py-2 ${currentPage === 'contacto' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              Contacto
            </Link>
            
            {/* Admin Panel Link - Solo visible para admins */}
            {isMounted && isAdmin && (
              <Link 
                href="/admin" 
                className={`px-3 py-2 ${currentPage === 'admin' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
              >
                Panel Admin
              </Link>
            )}
            
            {/* Auth Links */}
            {isMounted && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">Hola, {user?.firstName}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/auth/login" 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Ingresar
                  </Link>
                )}
              </>
            )}
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
                className={`block px-3 py-2 ${currentPage === 'home' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                href="/turnos" 
                className={`block px-3 py-2 ${currentPage === 'turnos' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Solicitar Turno
              </Link>
              <Link 
                href="/diplomas" 
                className={`block px-3 py-2 ${currentPage === 'diplomas' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Diplomas
              </Link>
              <Link 
                href="/contacto" 
                className={`block px-3 py-2 ${currentPage === 'contacto' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              
              {/* Admin Panel Link - Mobile */}
              {isMounted && isAdmin && (
                <Link 
                  href="/admin" 
                  className={`block px-3 py-2 ${currentPage === 'admin' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Panel Admin
                </Link>
              )}
              
              {/* Auth Links - Mobile */}
              {isMounted && (
                <>
                  {isAuthenticated ? (
                    <div className="px-3 py-2">
                      <p className="text-gray-600 mb-2">Hola, {user?.firstName}</p>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <Link 
                      href="/auth/login" 
                      className="block mx-3 my-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Ingresar
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
