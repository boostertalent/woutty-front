import { ReactNode } from 'react';

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  loading,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  subtitle?: string;
  loading?: boolean;
}) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-gray-50 text-[#D4A017]">{icon}</div>
      {trend && <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
    {loading ? (
      <div className="mt-2 space-y-2">
        <div className="h-7 w-32 rounded bg-gray-100 animate-pulse" />
        {subtitle ? <div className="h-4 w-40 rounded bg-gray-100 animate-pulse" /> : null}
      </div>
    ) : (
      <>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {subtitle ? <p className="text-xs text-gray-400 mt-2">{subtitle}</p> : null}
      </>
    )}
  </div>
);