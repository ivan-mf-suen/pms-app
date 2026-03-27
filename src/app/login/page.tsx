'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PasswordInput from '@/components/PasswordInput';
import { ValidationFeedback, FormError } from '@/components/ValidationFeedback';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const router = useRouter();
  const { login, getRememberedEmail, rememberEmail } = useAuth();

  // Load remembered email on mount
  useEffect(() => {
    const remembered = getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, [getRememberedEmail]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = isValidEmail && password && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

      if (login(email, password)) {
        // Save email if Remember Me is checked
        if (rememberMe) {
          rememberEmail(email);
        }
        router.push('/');
      } else {
        setError('Unable to sign in with those credentials. Please try again.');
      }
    } catch {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 5h4"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">PMS</h1>
          <p className="text-slate-700 mt-2 text-sm">Property Management System</p>
        </div>

        {/* Error Message */}
        {error && <FormError message={error} type="error" />}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                emailTouched && email && !isValidEmail
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              required
              aria-required="true"
              aria-invalid={emailTouched && email && !isValidEmail ? true : false}
              aria-describedby={
                emailTouched && email && !isValidEmail ? 'email-error' : undefined
              }
            />
            {emailTouched && (
              <ValidationFeedback email={email} showValidation={true} />
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-900"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              ariaInvalid={false}
            />
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              aria-label="Remember this email for next time"
            />
            <label
              htmlFor="remember"
              className="ml-2 text-sm text-slate-700 cursor-pointer hover:text-slate-900"
            >
              Remember this email
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-700 font-medium transition-colors"
          >
            {showDemoCredentials ? 'Hide' : 'Show'} demo credentials
          </button>

          {showDemoCredentials && (
            <div className="mt-4 space-y-2 text-xs">
              <p className="text-slate-700 font-semibold mb-2">
                Demo accounts (development only):
              </p>
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800">
                <p className="font-mono text-xs mb-1">ivan.mf.suen@poleungkuk.org.hk/ admin123</p>
                <p className="text-yellow-700 text-xs">Admin</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800">
                <p className="font-mono text-xs mb-1">manager@poleungkuk.org.hk / manager123</p>
                <p className="text-yellow-700 text-xs">Property Manager</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800">
                <p className="font-mono text-xs mb-1">demo@poleungkuk.org.hk / demo123</p>
                <p className="text-yellow-700 text-xs">Demo User</p>
              </div>
            </div>
          )}

          {/* Support Link */}
          <p className="text-center text-xs text-slate-600 mt-4">
            Need help?{' '}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
