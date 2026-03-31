'use client';

import StatCard from '@/components/StatCard';
import PropertyCard from '@/components/PropertyCard';
import MaintenanceList from '@/components/MaintenanceList';
import RecentPayments from '@/components/RecentPayments';
import { useI18n } from '@/contexts/I18nContext';
import {
  mockProperties,
  mockTenants,
  mockMaintenanceRequests,
  mockPayments,
  mockInventory,
} from '@/lib/mockData';
import Link from 'next/link';

export default function Home() {
  const { t } = useI18n();
  
  // Helper function to check if warranty is expired
  const isWarrantyExpired = (warrantyEnd: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const warranty = new Date(warrantyEnd);
    warranty.setHours(0, 0, 0, 0);
    return warranty.getTime() < today.getTime();
  };
  
  // Calculate statistics
  const totalProperties = mockProperties.length;
  const occupiedProperties = mockProperties.filter((p) => p.status === 'occupied').length;
  const totalPortfolioValue = mockProperties.reduce((sum, p) => sum + p.currentValue, 0);
  const totalMonthlyRent = mockTenants.reduce((sum, t) => sum + t.monthlyRent, 0);
  const maintenanceIssues = mockMaintenanceRequests.filter((r) => r.status !== 'completed').length;
  const pendingPayments = mockPayments.filter((p) => p.status === 'pending' || p.status === 'overdue').length;
  
  // Count expired warranty items
  const expiredWarrantyCount = mockInventory.filter((item) =>
    item.locations.some((loc) => isWarrantyExpired(loc.warrantyEnd))
  ).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('dashboard')}</h1>
          <p className="text-gray-600 mt-1">{t('welcomeMessage')}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            label={t('totalProperties')}
            value={totalProperties}
            subtext={`${occupiedProperties} ${t('occupied')}`}
            icon="🏢"
          />
           <StatCard
            label={t('maintenanceIssues')}
            value={maintenanceIssues}
            subtext={`${mockMaintenanceRequests.filter((r) => (r.priority === 'urgent' || r.priority === 'high') && r.status !== 'completed').length} ${t('urgent')}`}
            icon="🔧"
          />
          <Link href="/inventory?warranty=expired" className="block">
            <StatCard
              label={t('expiredWarrantyItems')}
              value={expiredWarrantyCount}
              subtext={t('expiredWarranties')}
              icon="⚠️"
              borderColor="border-red-400"
            />
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Featured Properties */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">{t('featuredProperties')}</h2>
                <a href="/properties" className="text-blue-600 hover:underline text-sm">
                  {t('viewAll')} →
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockProperties.slice(0, 4).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Maintenance Requests Row */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">{t('recentMaintenanceRequests')}</h2>
                  <a href="/maintenance" className="text-blue-600 hover:underline text-sm">
                    {t('viewAll')} →
                  </a>
                </div>
                <MaintenanceList requests={mockMaintenanceRequests} />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
