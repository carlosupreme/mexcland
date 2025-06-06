
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart } from 'lucide-react';

interface DashboardHeaderProps {
  estadisticas: {
    totalTinas: number;
    tinasConDatos: number;
    totalLecturas: number;
  };
  metricaSeleccionada: 'temperatura' | 'pH' | 'humedad' | 'nivel_liquido';
  onMetricaChange: (metrica: 'temperatura' | 'pH' | 'humedad' | 'nivel_liquido') => void;
}

const DashboardHeader = ({ estadisticas, metricaSeleccionada, onMetricaChange }: DashboardHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <BarChart size={32} className="text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Monitoreo</h1>
          <p className="text-gray-600">Sistema de control de tinas de fermentación</p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.totalTinas}</div>
            <p className="text-sm text-gray-600">Tinas con sensores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{estadisticas.tinasConDatos}</div>
            <p className="text-sm text-gray-600">Tinas con datos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{estadisticas.totalLecturas}</div>
            <p className="text-sm text-gray-600">Total de lecturas</p>
          </CardContent>
        </Card>
      </div>

      {/* Selector de métrica */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Filtro de Métricas</h3>
            <p className="text-gray-600 mb-4">Selecciona la métrica que deseas visualizar en las gráficas individuales</p>
            <Select value={metricaSeleccionada} onValueChange={onMetricaChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temperatura">Temperatura (°C)</SelectItem>
                <SelectItem value="pH">pH</SelectItem>
                <SelectItem value="humedad">Humedad (%)</SelectItem>
                <SelectItem value="nivel_liquido">Nivel Líquido (%)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHeader;
