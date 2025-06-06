
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { LecturaConTina } from '@/types/dashboard';

interface CompleteTinaChartProps {
  tinaNombre: string;
  lecturas: LecturaConTina[];
}

const chartConfig = {
  temperatura: {
    label: "Temperatura (°C)",
    color: "#ef4444", // red-500
  },
  pH: {
    label: "pH",
    color: "#3b82f6", // blue-500
  },
  humedad: {
    label: "Humedad (%)",
    color: "#10b981", // emerald-500
  },
  nivel_liquido: {
    label: "Nivel Líquido (%)",
    color: "#f59e0b", // amber-500
  },
};

const CompleteTinaChart = ({ tinaNombre, lecturas }: CompleteTinaChartProps) => {
  const data = lecturas
    .filter(lectura => 
      lectura.temperatura !== null || 
      lectura.pH !== null || 
      lectura.humedad !== null || 
      lectura.nivel_liquido !== null
    )
    .map(lectura => ({
      fecha: format(new Date(lectura.created_at), 'dd/MM HH:mm'),
      temperatura: lectura.temperatura,
      pH: lectura.pH,
      humedad: lectura.humedad,
      nivel_liquido: lectura.nivel_liquido,
      fechaCompleta: lectura.created_at
    }))
    .slice(-30); // Últimas 30 lecturas

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{tinaNombre} - Todas las Métricas</CardTitle>
        <CardDescription>
          Temperatura, pH, Humedad y Nivel de Líquido - Últimas 30 lecturas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fecha" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  fontSize={12}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      return format(new Date(payload[0].payload.fechaCompleta), 'dd/MM/yyyy HH:mm');
                    }
                    return value;
                  }}
                />
                <Legend />
                
                <Line 
                  type="monotone" 
                  dataKey="temperatura" 
                  stroke={chartConfig.temperatura.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={chartConfig.temperatura.label}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="pH" 
                  stroke={chartConfig.pH.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={chartConfig.pH.label}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="humedad" 
                  stroke={chartConfig.humedad.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={chartConfig.humedad.label}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="nivel_liquido" 
                  stroke={chartConfig.nivel_liquido.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={chartConfig.nivel_liquido.label}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No hay datos disponibles para mostrar
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompleteTinaChart;
