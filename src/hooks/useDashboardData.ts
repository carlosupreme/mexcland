
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tina, Lectura, LecturaConTina } from '@/types/dashboard';

export const useDashboardData = () => {
  const { toast } = useToast();
  const [tinas, setTinas] = useState<Tina[]>([]);
  const [lecturas, setLecturas] = useState<LecturaConTina[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Obteniendo datos de tinas y lecturas...');
      
      const { data: tinasData, error: tinasError } = await supabase
        .from('tinas')
        .select('id, nombre, sensor_id')
        .not('sensor_id', 'is', null);

      if (tinasError) throw tinasError;

      console.log('Tinas obtenidas:', tinasData);

      if (tinasData && tinasData.length > 0) {
        const sensorIds = tinasData.map(tina => tina.sensor_id).filter(Boolean);
        console.log('Sensor IDs encontrados:', sensorIds);
        
        const { data: lecturasData, error: lecturasError } = await supabase
          .from('lectura')
          .select('*')
          .in('sensor_id', sensorIds)
          .order('created_at', { ascending: false })
          .limit(1000);

        if (lecturasError) throw lecturasError;

        console.log('Lecturas obtenidas:', lecturasData?.length || 0);

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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('Configurando suscripción de realtime...');
    
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
          console.log('Nueva lectura insertada (realtime):', payload);
          const newLectura = payload.new as Lectura;
          
          setTinas(currentTinas => {
            const tina = currentTinas.find(t => t.sensor_id === newLectura.sensor_id);
            if (tina) {
              const lecturaConTina: LecturaConTina = {
                ...newLectura,
                tina_nombre: tina.nombre
              };
              
              setLecturas(prevLecturas => {
                console.log('Agregando nueva lectura a la lista');
                return [lecturaConTina, ...prevLecturas];
              });
              
              toast({
                title: "Nueva lectura",
                description: `Se registró una nueva lectura en ${tina.nombre}`,
              });
            } else {
              console.log('No se encontró tina para sensor_id:', newLectura.sensor_id);
            }
            return currentTinas;
          });
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
          console.log('Lectura actualizada (realtime):', payload);
          const updatedLectura = payload.new as Lectura;
          
          setTinas(currentTinas => {
            const tina = currentTinas.find(t => t.sensor_id === updatedLectura.sensor_id);
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
            return currentTinas;
          });
        }
      )
      .subscribe((status) => {
        console.log('Estado de suscripción realtime:', status);
      });

    return () => {
      console.log('Limpiando suscripción realtime...');
      supabase.removeChannel(channel);
    };
  }, [toast]);

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

  return {
    tinas,
    lecturas,
    loading,
    getLecturasPorTina,
    getEstadisticas
  };
};
