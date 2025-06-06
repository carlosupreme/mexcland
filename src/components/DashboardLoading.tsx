
import DashboardNavigation from '@/components/DashboardNavigation';

const DashboardLoading = () => {
  return (
    <div className="flex h-screen">
      <DashboardNavigation />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoading;
