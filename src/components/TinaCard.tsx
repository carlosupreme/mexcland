
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Droplet, Thermometer } from 'lucide-react';
import { format } from 'date-fns';
import { Tina, LecturaConTina } from '@/types/dashboard';

interface TinaCardProps {
  tina: Tina;
  lecturas: LecturaConTina[];
  alertasActivas: number;
}

const TinaCard = ({ tina, lecturas, alertasActivas }: TinaCardProps) => {
  const ultimaLectura = lecturas.length > 0 ? lecturas[0] : null;
  
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Disponible':
        return 'default';
      case 'En uso':
        return 'secondary';
      case 'Mantenimiento':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Disponible':
        return 'from-green-50 to-green-100 border-green-200';
      case 'En uso':
        return 'from-orange-50 to-orange-100 border-orange-200';
      case 'Mantenimiento':
        return 'from-red-50 to-red-100 border-red-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm a');
  };

  // Calcular nivel de líquido basado en capacidad (simulado si no hay lectura)
  const nivelLiquido = ultimaLectura?.nivel_liquido || Math.floor(Math.random() * 100);
  const liquidoActual = tina.capacidad ? Math.floor((nivelLiquido / 100) * tina.capacidad) : 0;

  return (
    <Card className={`shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${getEstadoColor(tina.estado)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">{tina.nombre}</CardTitle>
            <Badge variant={getEstadoBadgeVariant(tina.estado)} className="mt-1">
              {tina.estado}
            </Badge>
          </div>
          {alertasActivas > 0 && (
            <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              {alertasActivas}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Nivel de Fluido */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Nivel de Fluido</span>
            <span className="text-sm font-bold text-gray-900">{nivelLiquido}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${nivelLiquido}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-600">
            {liquidoActual.toLocaleString()} / {(tina.capacidad || 0).toLocaleString()} L
          </span>
        </div>

        {/* Métricas */}
        {ultimaLectura && (
          <div className="grid grid-cols-2 gap-4">
            {ultimaLectura.pH && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="text-xs text-gray-600">pH</div>
                  <div className="font-bold text-gray-900">{ultimaLectura.pH}</div>
                </div>
              </div>
            )}
            
            {ultimaLectura.temperatura && (
              <div className="flex items-center gap-2">
                <Thermometer className="w-3 h-3 text-orange-500" />
                <div>
                  <div className="text-xs text-gray-600">Temp</div>
                  <div className="font-bold text-gray-900">{ultimaLectura.temperatura}°C</div>
                </div>
              </div>
            )}

            {ultimaLectura.humedad && (
              <div className="flex items-center gap-2">
                <Droplet className="w-3 h-3 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-600">Humedad</div>
                  <div className="font-bold text-gray-900">{ultimaLectura.humedad}%</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información adicional */}
        <div className="space-y-1 text-xs text-gray-600">
          {tina.tipo_agave && (
            <div>
              <span className="font-medium">{tina.tipo_agave}</span>
            </div>
          )}
          {tina.sensor_id && (
            <div className="flex items-center gap-1">
              <span>Sensor:</span>
              <span className="font-mono">{tina.sensor_id.substring(0, 8)}...</span>
            </div>
          )}
          {ultimaLectura && (
            <div className="flex items-center gap-1">
              <span>🕒 Actualizado:</span>
              <span>{formatDate(ultimaLectura.created_at)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TinaCard;
