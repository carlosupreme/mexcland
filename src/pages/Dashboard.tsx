
import { useState } from 'react';
import DashboardNavigation from '@/components/DashboardNavigation';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardEmptyState from '@/components/DashboardEmptyState';
import DashboardCharts from '@/components/DashboardCharts';
import DashboardLoading from '@/components/DashboardLoading';
import TinasActivasSection from '@/components/TinasActivasSection';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const [metricaSeleccionada, setMetricaSeleccionada] = useState<'temperatura' | 'pH' | 'humedad' | 'nivel_liquido'>('temperatura');
  const { tinas, lecturas, loading, getLecturasPorTina, getEstadisticas, alertasPorTina } = useDashboardData();

  const estadisticas = getEstadisticas();

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNavigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <DashboardHeader 
            estadisticas={estadisticas}
            metricaSeleccionada={metricaSeleccionada}
            onMetricaChange={setMetricaSeleccionada}
          />

          <TinasActivasSection 
            tinas={tinas}
            lecturas={lecturas}
            getLecturasPorTina={getLecturasPorTina}
            alertasPorTina={alertasPorTina}
          />

          {tinas.length === 0 ? (
            <DashboardEmptyState />
          ) : (
            <DashboardCharts 
              tinas={tinas}
              lecturas={lecturas}
              metricaSeleccionada={metricaSeleccionada}
              getLecturasPorTina={getLecturasPorTina}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
