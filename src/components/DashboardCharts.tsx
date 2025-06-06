
import { LecturaConTina, Tina } from '@/types/dashboard';
import GeneralChart from '@/components/GeneralChart';
import TinaChart from '@/components/TinaChart';
import MultiMetricChart from '@/components/MultiMetricChart';

interface DashboardChartsProps {
  tinas: Tina[];
  lecturas: LecturaConTina[];
  metricaSeleccionada: 'temperatura' | 'pH' | 'humedad' | 'nivel_liquido';
  getLecturasPorTina: (tinaId: string) => LecturaConTina[];
}

const DashboardCharts = ({ 
  tinas, 
  lecturas, 
  metricaSeleccionada, 
  getLecturasPorTina 
}: DashboardChartsProps) => {
  return (
    <div className="space-y-6">
      {/* Gráfica multi-métrica */}
      <MultiMetricChart lecturas={lecturas} />
      
      {/* Gráfica general por métrica seleccionada */}
      <GeneralChart lecturas={lecturas} metrica={metricaSeleccionada} />
      
      {/* Gráficas individuales por métrica */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gráficas por Métrica Individual</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tinas.map((tina) => (
            <TinaChart
              key={`metric-${tina.id}`}
              tinaNombre={tina.nombre}
              lecturas={getLecturasPorTina(tina.id)}
              metrica={metricaSeleccionada}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
