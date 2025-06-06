
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface Lectura {
  id: string;
  temperatura: number | null;
  pH: number | null;
  humedad: number | null;
  nivel_liquido: number | null;
  created_at: string;
  tina_nombre: string;
}

interface GeneralChartProps {
  lecturas: Lectura[];
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

const GeneralChart = ({ lecturas, metrica }: GeneralChartProps) => {
  const data = lecturas
    .filter(lectura => lectura[metrica] !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-50) // Últimas 50 lecturas
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

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Gráfica General - {chartConfig[metrica].label}</CardTitle>
        <CardDescription>
          Todas las tinas - Últimas 50 lecturas
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
                      return `${format(new Date(payload[0].payload.fechaCompleta), 'dd/MM/yyyy HH:mm')} - ${payload[0].payload.tina}`;
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
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No hay datos disponibles para {chartConfig[metrica].label.toLowerCase()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneralChart;
