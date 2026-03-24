'use client';

interface ValidationFeedbackProps {
  email: string;
  showValidation?: boolean;
}

export function ValidationFeedback({
  email,
  showValidation = false,
}: ValidationFeedbackProps) {
  if (!showValidation || !email) return null;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValidEmail && email) {
    return (
      <p
        className="text-xs text-red-600 mt-1"
        role="status"
        aria-live="polite"
        id="email-error"
      >
        Please enter a valid email address
      </p>
    );
  }

  return null;
}

interface FormErrorProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export function FormError({ message, type = 'error' }: FormErrorProps) {
  if (!message) return null;

  const colors = {
    error: 'bg-red-50 border-red-300 text-red-700',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    info: 'bg-blue-50 border-blue-300 text-blue-700',
  };

  return (
    <div
      className={`border px-4 py-3 rounded-lg text-sm ${colors[type]}`}
      role="alert"
    >
      {message}
    </div>
  );
}
