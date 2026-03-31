'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <nav className="sticky top-0 z-50 bg-slate-800 text-white shadow-lg">
      <div className="max-w-[88rem] mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl">
              🏠 PMS Prototype
            </Link>
            <div className="hidden md:flex gap-6">
              <Link
                href="/"
                className={`hover:text-blue-200 transition ${
                  isActive('/') ? 'text-blue-300 border-b-2 border-blue-300' : ''
                }`}
              >
                {t('dashboard')}
              </Link>
              <Link
                href="/properties"
                className={`hover:text-blue-200 transition ${
                  isActive('/properties')
                    ? 'text-blue-300 border-b-2 border-blue-300'
                    : ''
                }`}
              >
                {t('properties')}
              </Link>
              <Link
                href="/inventory"
                className={`hover:text-blue-200 transition ${
                  isActive('/inventory')
                    ? 'text-blue-300 border-b-2 border-blue-300'
                    : ''
                }`}
              >
                {t('inventory')}
              </Link>
              <Link
                href="/work-orders"
                className={`hover:text-blue-200 transition ${
                  isActive('/work-orders')
                    ? 'text-blue-300 border-b-2 border-blue-300'
                    : ''
                }`}
              >
                {t('workOrders')}
              </Link>
              <Link
                href="/maintenance"
                className={`hover:text-blue-200 transition ${
                  isActive('/maintenance')
                    ? 'text-blue-300 border-b-2 border-blue-300'
                    : ''
                }`}
              >
                {t('maintenance')}
              </Link>
              <Link
                href="/documents"
                className={`hover:text-blue-200 transition ${
                  isActive('/documents')
                    ? 'text-blue-300 border-b-2 border-blue-300'
                    : ''
                }`}
              >
                {t('documents')}
              </Link>
              <Link
                href="/reports"
                className={`hover:text-blue-200 transition ${
                  isActive('/reports')
                    ? 'text-blue-300 border-b-2 border-blue-300'
                    : ''
                }`}
              >
                {t('reports')}
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`hover:text-blue-200 transition ${
                    isActive('/admin') ? 'text-blue-300 border-b-2 border-blue-300' : ''
                  }`}
                >
                  {t('admin')}
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
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
              <p className="text-gray-300">{user?.email}</p>
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
      </div>
    </nav>
  );
}
