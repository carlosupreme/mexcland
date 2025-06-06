import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import { LecturaConTina } from '@/types/dashboard';

interface TinaChartProps {
  tinaNombre: string;
  lecturas: LecturaConTina[];
  metrica: 'temperatura' | 'pH' | 'humedad' | 'nivel_liquido';
}

const chartConfig = {
  temperatura: {
    label: "Temperatura",
    color: "#3b82f6",
    gradient: "url(#colorTemperatura)",
    bgColor: "from-blue-50 to-blue-100",
  },
  pH: {
    label: "pH",
    color: "#10b981",
    gradient: "url(#colorPH)",
    bgColor: "from-emerald-50 to-emerald-100",
  },
  humedad: {
    label: "Humedad",
    color: "#f59e0b",
    gradient: "url(#colorHumedad)",
    bgColor: "from-amber-50 to-amber-100",
  },
  nivel_liquido: {
    label: "Nivel Líquido",
    color: "#8b5cf6",
    gradient: "url(#colorNivel)",
    bgColor: "from-violet-50 to-violet-100",
  },
};

const TinaChart = ({ tinaNombre, lecturas, metrica }: TinaChartProps) => {
  const data = lecturas
    .filter(lectura => lectura[metrica] !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-20)
    .map(lectura => ({
      fecha: format(new Date(lectura.created_at), 'dd/MM HH:mm'),
      valor: lectura[metrica],
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

  const ultimoValor = data.length > 0 ? data[data.length - 1].valor : null;

  return (
    <Card className={`shadow-lg border-0 bg-gradient-to-br ${chartConfig[metrica].bgColor} transition-all duration-300 hover:shadow-xl`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xl">{getIcon(metrica)}</div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">{tinaNombre}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {chartConfig[metrica].label} • Últimas 20 lecturas
              </CardDescription>
            </div>
          </div>
          {ultimoValor !== null && (
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: chartConfig[metrica].color }}>
                {ultimoValor}{getUnidad(metrica)}
              </div>
              <div className="text-xs text-gray-500">Último valor</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                <defs>
                  <linearGradient id="colorTemperatura" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorHumedad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorNivel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e2e8f0" 
                  strokeOpacity={0.6}
                />
                <XAxis 
                  dataKey="fecha" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                />
                <YAxis 
                  fontSize={11}
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
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-semibold text-gray-900 mb-1">
                            {format(new Date(data.fechaCompleta), 'dd/MM/yyyy HH:mm')}
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
                  strokeWidth={2.5}
                  fill={chartConfig[metrica].gradient}
                  dot={{ 
                    fill: chartConfig[metrica].color, 
                    strokeWidth: 2, 
                    stroke: '#fff',
                    r: 3 
                  }}
                  activeDot={{ 
                    r: 5, 
                    stroke: chartConfig[metrica].color,
                    strokeWidth: 2,
                    fill: '#fff'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex flex-col items-center justify-center text-gray-500 bg-white/60 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-3xl mb-3">{getIcon(metrica)}</div>
            <p className="font-medium mb-1">Sin datos</p>
            <p className="text-xs text-center">Esperando lecturas de<br/>{chartConfig[metrica].label.toLowerCase()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TinaChart;
