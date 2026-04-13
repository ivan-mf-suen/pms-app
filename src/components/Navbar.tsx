'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    router.push('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh-Hant' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-500 text-white shadow-lg">
      <div className="max-w-[88rem] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl">
              <img src="/plk_logo.svg" alt="PMS Logo" className="h-12 mr-4 inline-block" />
              <span className="text-base">{t('pms_phototype')}</span>
            </Link>
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6">
              <Link
                href="/"
                className={`hover:text-blue-200 transition ${isActive('/') ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
              >
                {t('dashboard')}
              </Link>
              <Link
                href="/properties"
                className={`hover:text-blue-200 transition ${isActive('/properties') ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
              >
                {t('properties')}
              </Link>
              <Link
                href="/inventory"
                className={`hover:text-blue-200 transition ${isActive('/inventory') ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
              >
                {t('inventory')}
              </Link>
              <Link
                href="/maintenance"
                className={`hover:text-blue-200 transition ${isActive('/maintenance') ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
              >
                {t('maintenance')}
              </Link>
              <Link
                href="/work-orders"
                className={`hover:text-blue-200 transition ${isActive('/work-orders') ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
              >
                {t('workOrders')}
              </Link>
              <Link
                href="/tendering"
                className={`hover:text-blue-200 transition ${isActive('/tendering') ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
              >
                {t('tendering') || 'Tendering'}
              </Link>
              <Link
                href="/documents"
                className={`hover:text-blue-200 transition ${isActive('/documents') ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
              >
                {t('documents')}
              </Link>
              <Link
                href="/reports"
                className={`hover:text-blue-200 transition ${isActive('/reports') ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
              >
                {t('reports')}
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`hover:text-blue-200 transition ${isActive('/admin') ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
                >
                  {t('admin')}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-slate-700 rounded transition"
              title="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Right side controls (Language, User info, Logout) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded transition text-sm font-semibold"
              title="Toggle Language"
            >
              {language === 'en' ? '繁體' : 'EN'}
            </button>

            {/* User Info */}
            <div className="text-sm">
              <p className="text-gray-300">{user?.name}</p>
              <p className="text-gray-400 text-xs">{user?.role}</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50"
            >
              {t('logout')}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Expanded */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            <Link
              href="/"
              className={`block px-4 py-2 rounded hover:bg-slate-700 transition ${isActive('/') ? 'bg-blue-600 text-blue-100' : ''
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('dashboard')}
            </Link>
            <Link
              href="/properties"
              className={`block px-4 py-2 rounded hover:bg-slate-700 transition ${isActive('/properties') ? 'bg-blue-600 text-blue-100' : ''
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('properties')}
            </Link>
            <Link
              href="/inventory"
              className={`block px-4 py-2 rounded hover:bg-slate-700 transition ${isActive('/inventory') ? 'bg-blue-600 text-blue-100' : ''
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('inventory')}
            </Link>
            <Link
              href="/maintenance"
              className={`block px-4 py-2 rounded hover:bg-slate-700 transition ${isActive('/maintenance') ? 'bg-blue-600 text-blue-100' : ''
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('maintenance')}
            </Link>
            <Link
              href="/work-orders"
              className={`block px-4 py-2 rounded hover:bg-slate-700 transition ${isActive('/work-orders') ? 'bg-blue-600 text-blue-100' : ''
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('workOrders')}
            </Link>
            <Link
              href="/tendering"
              className={`block px-4 py-2 rounded hover:bg-slate-700 transition ${isActive('/tendering') ? 'bg-blue-600 text-blue-100' : ''
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('tendering') || 'Tendering'}
            </Link>
            <Link
              href="/documents"
              className={`block px-4 py-2 rounded hover:bg-slate-700 transition ${isActive('/documents') ? 'bg-blue-600 text-blue-100' : ''
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('documents')}
            </Link>
            <Link
              href="/reports"
              className={`block px-4 py-2 rounded hover:bg-slate-700 transition ${isActive('/reports') ? 'bg-blue-600 text-blue-100' : ''
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('reports')}
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`block px-4 py-2 rounded hover:bg-slate-700 transition ${isActive('/admin') ? 'bg-blue-600 text-blue-100' : ''
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('admin')}
              </Link>
            )}
            <hr className="my-4 border-slate-700" />
            {/* User Info - Mobile */}
            <div className="px-4 py-3 bg-slate-700 rounded mb-3">
              <p className="text-sm text-gray-300">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-1">{user?.role}</p>
            </div>
            <button
              onClick={() => {
                toggleLanguage();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition text-sm font-semibold"
            >
              {language === 'en' ? '繁體' : 'EN'}
            </button>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              disabled={isLoggingOut}
              className="block w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50"
            >
              {t('logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
