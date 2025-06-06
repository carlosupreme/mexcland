
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import { LecturaConTina } from '@/types/dashboard';

interface GeneralChartProps {
  lecturas: LecturaConTina[];
  metrica: 'temperatura' | 'pH' | 'humedad' | 'nivel_liquido';
}

const chartConfig = {
  temperatura: {
    label: "Temperatura",
    color: "#3b82f6",
    gradient: "url(#colorTemperatura)",
  },
  pH: {
    label: "pH",
    color: "#10b981",
    gradient: "url(#colorPH)",
  },
  humedad: {
    label: "Humedad",
    color: "#f59e0b",
    gradient: "url(#colorHumedad)",
  },
  nivel_liquido: {
    label: "Nivel Líquido",
    color: "#8b5cf6",
    gradient: "url(#colorNivel)",
  },
};

const GeneralChart = ({ lecturas, metrica }: GeneralChartProps) => {
  const data = lecturas
    .filter(lectura => lectura[metrica] !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-50)
    .map(lectura => ({
      fecha: format(new Date(lectura.created_at), 'dd/MM HH:mm'),
      valor: lectura[metrica],
      tina: lectura.tina_nombre,
      fechaCompleta: lectura.created_at
    }));

  const getUnidad = (metrica: string) => {
    switch (metrica) {
      case 'temperatura':
        return '°C';
      case 'pH':
        return '';
      case 'humedad':
        return '%';
      case 'nivel_liquido':
        return '%';
      default:
        return '';
    }
  };

  const getIcon = (metrica: string) => {
    switch (metrica) {
      case 'temperatura':
        return '🌡️';
      case 'pH':
        return '⚗️';
      case 'humedad':
        return '💧';
      case 'nivel_liquido':
        return '📊';
      default:
        return '📈';
    }
  };

  return (
    <Card className="col-span-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getIcon(metrica)}</div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Gráfica General - {chartConfig[metrica].label}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Monitoreo en tiempo real de todas las tinas • Últimas 50 lecturas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="colorTemperatura" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorPH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorHumedad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorNivel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e2e8f0" 
                  strokeOpacity={0.6}
                />
                <XAxis 
                  dataKey="fecha" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                />
                <YAxis 
                  fontSize={12}
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                  label={{ 
                    value: getUnidad(metrica), 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#64748b', fontWeight: 'bold' }
                  }}
                />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-semibold text-gray-900 mb-2">
                            {format(new Date(data.fechaCompleta), 'dd/MM/yyyy HH:mm')}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            Tina: <span className="font-medium text-gray-900">{data.tina}</span>
                          </p>
                          <p className="text-sm">
                            {chartConfig[metrica].label}: 
                            <span className="font-bold ml-1" style={{ color: chartConfig[metrica].color }}>
                              {payload[0].value}{getUnidad(metrica)}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke={chartConfig[metrica].color}
                  strokeWidth={3}
                  fill={chartConfig[metrica].gradient}
                  dot={{ 
                    fill: chartConfig[metrica].color, 
                    strokeWidth: 2, 
                    stroke: '#fff',
                    r: 4 
                  }}
                  activeDot={{ 
                    r: 6, 
                    stroke: chartConfig[metrica].color,
                    strokeWidth: 2,
                    fill: '#fff'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium mb-2">No hay datos disponibles</p>
            <p className="text-sm">Esperando lecturas de {chartConfig[metrica].label.toLowerCase()}...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneralChart;
