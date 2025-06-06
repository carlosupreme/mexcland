import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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
    color: "hsl(var(--chart-1))",
  },
  pH: {
    label: "pH",
    color: "hsl(var(--chart-2))",
  },
  humedad: {
    label: "Humedad",
    color: "hsl(var(--chart-3))",
  },
  nivel_liquido: {
    label: "Nivel Líquido",
    color: "hsl(var(--chart-4))",
  },
};

const TinaChart = ({ tinaNombre, lecturas, metrica }: TinaChartProps) => {
  const data = lecturas
    .filter(lectura => lectura[metrica] !== null)
    .map(lectura => ({
      fecha: format(new Date(lectura.created_at), 'dd/MM HH:mm'),
      valor: lectura[metrica],
      fechaCompleta: lectura.created_at
    }))
    .slice(-20); // Últimas 20 lecturas

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{tinaNombre}</CardTitle>
        <CardDescription>
          {chartConfig[metrica].label} - Últimas 20 lecturas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[200px]">
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
                  label={{ 
                    value: getUnidad(metrica), 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
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
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke={chartConfig[metrica].color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={chartConfig[metrica].label}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No hay datos disponibles para {chartConfig[metrica].label.toLowerCase()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TinaChart;
