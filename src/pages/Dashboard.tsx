
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardNavigation from '@/components/DashboardNavigation';
import TinaChart from '@/components/TinaChart';
import CompleteTinaChart from '@/components/CompleteTinaChart';
import GeneralChart from '@/components/GeneralChart';
import { BarChart } from 'lucide-react';
import { Tina, Lectura, LecturaConTina } from '@/types/dashboard';

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [tinas, setTinas] = useState<Tina[]>([]);
  const [lecturas, setLecturas] = useState<LecturaConTina[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricaSeleccionada, setMetricaSeleccionada] = useState<'temperatura' | 'pH' | 'humedad' | 'nivel_liquido'>('temperatura');

  useEffect(() => {
    fetchData();
    
    // Configurar suscripción en tiempo real
    const channel = supabase
      .channel('lectura-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lectura'
        },
        (payload) => {
          console.log('Nueva lectura insertada:', payload);
          handleNewLectura(payload.new as Lectura);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lectura'
        },
        (payload) => {
          console.log('Lectura actualizada:', payload);
          handleUpdatedLectura(payload.new as Lectura);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNewLectura = async (newLectura: Lectura) => {
    // Obtener el nombre de la tina para esta nueva lectura
    const tina = tinas.find(t => t.sensor_id === newLectura.sensor_id);
    if (tina) {
      const lecturaConTina: LecturaConTina = {
        ...newLectura,
        tina_nombre: tina.nombre
      };
      
      setLecturas(prevLecturas => [lecturaConTina, ...prevLecturas]);
      
      toast({
        title: "Nueva lectura",
        description: `Se registró una nueva lectura en ${tina.nombre}`,
      });
    }
  };

  const handleUpdatedLectura = async (updatedLectura: Lectura) => {
    // Actualizar la lectura existente
    const tina = tinas.find(t => t.sensor_id === updatedLectura.sensor_id);
    if (tina) {
      const lecturaConTina: LecturaConTina = {
        ...updatedLectura,
        tina_nombre: tina.nombre
      };
      
      setLecturas(prevLecturas => 
        prevLecturas.map(lectura => 
          lectura.id === updatedLectura.id ? lecturaConTina : lectura
        )
      );
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener tinas con sensores
      const { data: tinasData, error: tinasError } = await supabase
        .from('tinas')
        .select('id, nombre, sensor_id')
        .not('sensor_id', 'is', null);

      if (tinasError) throw tinasError;

      // Obtener lecturas de los sensores de las tinas
      if (tinasData && tinasData.length > 0) {
        const sensorIds = tinasData.map(tina => tina.sensor_id).filter(Boolean);
        
        const { data: lecturasData, error: lecturasError } = await supabase
          .from('lectura')
          .select('*')
          .in('sensor_id', sensorIds)
          .order('created_at', { ascending: false })
          .limit(1000); // Limitar para performance

        if (lecturasError) throw lecturasError;

        // Combinar datos de lecturas con nombres de tinas
        const lecturasConTinas: LecturaConTina[] = lecturasData?.map(lectura => {
          const tina = tinasData.find(t => t.sensor_id === lectura.sensor_id);
          return {
            ...lectura,
            tina_nombre: tina?.nombre || 'Tina desconocida'
          };
        }) || [];

        setLecturas(lecturasConTinas);
      }

      setTinas(tinasData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard."
      });
    } finally {
      setLoading(false);
    }
  };

  const getLecturasPorTina = (tinaId: string): LecturaConTina[] => {
    const tina = tinas.find(t => t.id === tinaId);
    if (!tina || !tina.sensor_id) return [];
    
    return lecturas.filter(lectura => lectura.sensor_id === tina.sensor_id);
  };

  const getEstadisticas = () => {
    const totalTinas = tinas.length;
    const tinasConDatos = tinas.filter(tina => getLecturasPorTina(tina.id).length > 0).length;
    const totalLecturas = lecturas.length;
    
    return { totalTinas, tinasConDatos, totalLecturas };
  };

  const estadisticas = getEstadisticas();

  if (loading) {
    return (
      <div className="flex h-screen">
        <DashboardNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNavigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
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
                <CardHeader>
                  <CardTitle>Filtro de Métricas</CardTitle>
                  <CardDescription>Selecciona la métrica que deseas visualizar en las gráficas individuales</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={metricaSeleccionada} onValueChange={(value: any) => setMetricaSeleccionada(value)}>
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

          {tinas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <BarChart size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No hay tinas con sensores configurados</h3>
                  <p className="mb-4">Para ver las gráficas, necesitas tener tinas con sensores asignados.</p>
                  {userRole === 'admin' && (
                    <Button onClick={() => window.location.href = '/tinas'}>
                      Configurar Tinas
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
