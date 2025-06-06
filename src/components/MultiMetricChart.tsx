
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { LecturaConTina } from '@/types/dashboard';

interface MultiMetricChartProps {
  lecturas: LecturaConTina[];
}

const chartConfig = {
  temperatura: {
    label: "Temperatura (°C)",
    color: "#3b82f6",
  },
  pH: {
    label: "pH",
    color: "#10b981",
  },
  humedad: {
    label: "Humedad (%)",
    color: "#f59e0b",
  },
  nivel_liquido: {
    label: "Nivel Líquido (%)",
    color: "#8b5cf6",
  },
};

const MultiMetricChart = ({ lecturas }: MultiMetricChartProps) => {
  // Procesar datos para mostrar todas las métricas
  const data = lecturas
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-50)
    .map(lectura => ({
      fecha: format(new Date(lectura.created_at), 'dd/MM HH:mm'),
      temperatura: lectura.temperatura,
      pH: lectura.pH,
      humedad: lectura.humedad,
      nivel_liquido: lectura.nivel_liquido,
      tina: lectura.tina_nombre,
      fechaCompleta: lectura.created_at
    }));

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📊</div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Monitoreo Completo de Sensores
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Todas las métricas en tiempo real • Últimas 50 lecturas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
                  height={70}
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
                    value: 'Valores', 
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
                        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
                          <p className="font-semibold text-gray-900 mb-2">
                            {format(new Date(data.fechaCompleta), 'dd/MM/yyyy HH:mm')}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Tina: <span className="font-medium text-gray-900">{data.tina}</span>
                          </p>
                          <div className="space-y-1">
                            {payload.map((entry, index) => {
                              if (entry.value !== null && entry.value !== undefined) {
                                return (
                                  <p key={index} className="text-sm flex justify-between">
                                    <span style={{ color: entry.color }}>{chartConfig[entry.dataKey as keyof typeof chartConfig]?.label}:</span>
                                    <span className="font-bold ml-2" style={{ color: entry.color }}>
                                      {entry.value}
                                      {entry.dataKey === 'temperatura' ? '°C' : 
                                       entry.dataKey === 'pH' ? '' : '%'}
                                    </span>
                                  </p>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
                />
                <Line 
                  type="monotone" 
                  dataKey="temperatura" 
                  stroke={chartConfig.temperatura.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: chartConfig.temperatura.color }}
                  activeDot={{ r: 5, stroke: chartConfig.temperatura.color, strokeWidth: 2, fill: '#fff' }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="pH" 
                  stroke={chartConfig.pH.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: chartConfig.pH.color }}
                  activeDot={{ r: 5, stroke: chartConfig.pH.color, strokeWidth: 2, fill: '#fff' }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="humedad" 
                  stroke={chartConfig.humedad.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: chartConfig.humedad.color }}
                  activeDot={{ r: 5, stroke: chartConfig.humedad.color, strokeWidth: 2, fill: '#fff' }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="nivel_liquido" 
                  stroke={chartConfig.nivel_liquido.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: chartConfig.nivel_liquido.color }}
                  activeDot={{ r: 5, stroke: chartConfig.nivel_liquido.color, strokeWidth: 2, fill: '#fff' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[500px] flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium mb-2">No hay datos disponibles</p>
            <p className="text-sm">Esperando lecturas de sensores...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiMetricChart;
