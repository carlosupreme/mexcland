
import { LecturaConTina, Tina } from '@/types/dashboard';
import GeneralChart from '@/components/GeneralChart';
import CompleteTinaChart from '@/components/CompleteTinaChart';
import TinaChart from '@/components/TinaChart';

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
      {/* Gráfica general */}
      <GeneralChart lecturas={lecturas} metrica={metricaSeleccionada} />
      
      {/* Gráficas completas por tina */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {tinas.map((tina) => (
          <CompleteTinaChart
            key={`complete-${tina.id}`}
            tinaNombre={tina.nombre}
            lecturas={getLecturasPorTina(tina.id)}
          />
        ))}
      </div>
      
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
