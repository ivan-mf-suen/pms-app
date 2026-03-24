'use client';

import { Payment, mockTenants } from '@/lib/mockData';

interface RecentPaymentsProps {
  payments: Payment[];
}

const statusColors: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-100',
  paid: 'text-green-600 bg-green-100',
  overdue: 'text-red-600 bg-red-100',
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toISOString().split('T')[0];
};

export default function RecentPayments({ payments }: RecentPaymentsProps) {
  const getTenantName = (tenantId: string) => {
    const tenant = mockTenants.find((t) => t.id === tenantId);
    return tenant?.name || 'Unknown Tenant';
  };

  return (
    <div className="space-y-2">
      {payments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No payments</p>
      ) : (
        payments.slice(0, 6).map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {getTenantName(payment.tenantId)}
              </p>
              <p className="text-xs text-gray-500">
                Due: {formatDate(payment.dueDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                ${payment.amount.toLocaleString()}
              </p>
              <span
                className={`text-xs px-2 py-1 rounded inline-block mt-1 ${statusColors[payment.status]}`}
              >
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
