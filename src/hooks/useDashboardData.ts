
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tina, Lectura, LecturaConTina } from '@/types/dashboard';

export const useDashboardData = () => {
  const { toast } = useToast();
  const [tinas, setTinas] = useState<Tina[]>([]);
  const [lecturas, setLecturas] = useState<LecturaConTina[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNewLectura = async (newLectura: Lectura) => {
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
      
      const { data: tinasData, error: tinasError } = await supabase
        .from('tinas')
        .select('id, nombre, sensor_id')
        .not('sensor_id', 'is', null);

      if (tinasError) throw tinasError;

      if (tinasData && tinasData.length > 0) {
        const sensorIds = tinasData.map(tina => tina.sensor_id).filter(Boolean);
        
        const { data: lecturasData, error: lecturasError } = await supabase
          .from('lectura')
          .select('*')
          .in('sensor_id', sensorIds)
          .order('created_at', { ascending: false })
          .limit(1000);

        if (lecturasError) throw lecturasError;

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
