
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tina, Lectura, LecturaConTina } from '@/types/dashboard';

interface AlertasStats {
  total: number;
  activas: number;
  resueltas: number;
}

interface UmbralTina {
  id: string;
  tina_id: string;
  ph_min: number | null;
  ph_max: number | null;
  temperatura_min: number | null;
  temperatura_max: number | null;
  humedad_min: number | null;
  humedad_max: number | null;
}

export const useDashboardData = () => {
  const { toast } = useToast();
  const [tinas, setTinas] = useState<Tina[]>([]);
  const [lecturas, setLecturas] = useState<LecturaConTina[]>([]);
  const [umbrales, setUmbrales] = useState<UmbralTina[]>([]);
  const [alertasStats, setAlertasStats] = useState<AlertasStats>({ total: 0, activas: 0, resueltas: 0 });
  const [alertasPorTina, setAlertasPorTina] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const verificarUmbrales = async (lectura: Lectura, tina: Tina) => {
    console.log('Verificando umbrales para lectura:', lectura, 'en tina:', tina.nombre);
    
    const umbralTina = umbrales.find(u => u.tina_id === tina.id);
    if (!umbralTina) {
      console.log('No se encontraron umbrales para la tina:', tina.nombre);
      return;
    }

    console.log('Umbrales encontrados:', umbralTina);
    
    const alertasACrear = [];

    // Verificar pH
    if (lectura.pH !== null) {
      if (umbralTina.ph_max !== null && lectura.pH > umbralTina.ph_max) {
        alertasACrear.push({
          tipo: 'ph_alto',
          mensaje: `pH ALTO en ${tina.nombre}: ${lectura.pH} > ${umbralTina.ph_max}`,
          valor_actual: lectura.pH,
          valor_umbral: umbralTina.ph_max
        });
      }
      if (umbralTina.ph_min !== null && lectura.pH < umbralTina.ph_min) {
        alertasACrear.push({
          tipo: 'ph_bajo',
          mensaje: `pH BAJO en ${tina.nombre}: ${lectura.pH} < ${umbralTina.ph_min}`,
          valor_actual: lectura.pH,
          valor_umbral: umbralTina.ph_min
        });
      }
    }

    // Verificar temperatura
    if (lectura.temperatura !== null) {
      if (umbralTina.temperatura_max !== null && lectura.temperatura > umbralTina.temperatura_max) {
        alertasACrear.push({
          tipo: 'temperatura_alta',
          mensaje: `TEMPERATURA ALTA en ${tina.nombre}: ${lectura.temperatura}°C > ${umbralTina.temperatura_max}°C`,
          valor_actual: lectura.temperatura,
          valor_umbral: umbralTina.temperatura_max
        });
      }
      if (umbralTina.temperatura_min !== null && lectura.temperatura < umbralTina.temperatura_min) {
        alertasACrear.push({
          tipo: 'temperatura_baja',
          mensaje: `TEMPERATURA BAJA en ${tina.nombre}: ${lectura.temperatura}°C < ${umbralTina.temperatura_min}°C`,
          valor_actual: lectura.temperatura,
          valor_umbral: umbralTina.temperatura_min
        });
      }
    }

    // Verificar humedad
    if (lectura.humedad !== null) {
      if (umbralTina.humedad_max !== null && lectura.humedad > umbralTina.humedad_max) {
        alertasACrear.push({
          tipo: 'humedad_alta',
          mensaje: `HUMEDAD ALTA en ${tina.nombre}: ${lectura.humedad}% > ${umbralTina.humedad_max}%`,
          valor_actual: lectura.humedad,
          valor_umbral: umbralTina.humedad_max
        });
      }
      if (umbralTina.humedad_min !== null && lectura.humedad < umbralTina.humedad_min) {
        alertasACrear.push({
          tipo: 'humedad_baja',
          mensaje: `HUMEDAD BAJA en ${tina.nombre}: ${lectura.humedad}% < ${umbralTina.humedad_min}%`,
          valor_actual: lectura.humedad,
          valor_umbral: umbralTina.humedad_min
        });
      }
    }

    // Verificar nivel de líquido
    if (lectura.nivel_liquido !== null) {
      if (lectura.nivel_liquido > 95) {
        alertasACrear.push({
          tipo: 'nivel_alto',
          mensaje: `NIVEL DE LÍQUIDO ALTO en ${tina.nombre}: ${lectura.nivel_liquido}%`,
          valor_actual: lectura.nivel_liquido,
          valor_umbral: 95
        });
      }
      if (lectura.nivel_liquido < 10) {
        alertasACrear.push({
          tipo: 'nivel_bajo',
          mensaje: `NIVEL DE LÍQUIDO BAJO en ${tina.nombre}: ${lectura.nivel_liquido}%`,
          valor_actual: lectura.nivel_liquido,
          valor_umbral: 10
        });
      }
    }

    // Crear las alertas y mostrar notificaciones
    for (const alerta of alertasACrear) {
      console.log('Creando alerta:', alerta);
      
      // Mostrar toast inmediatamente
      toast({
        variant: "destructive",
        title: "⚠️ ALERTA CRÍTICA",
        description: alerta.mensaje,
        duration: 10000, // 10 segundos
      });

      // Crear la alerta en la base de datos
      try {
        const { error } = await supabase
          .from('alertas')
          .insert({
            tina_id: tina.id,
            tipo_alerta: alerta.tipo,
            valor_actual: alerta.valor_actual,
            valor_umbral: alerta.valor_umbral,
            mensaje: alerta.mensaje,
            lectura_id: lectura.id,
            estado: 'activa'
          });

        if (error) {
          console.error('Error creando alerta:', error);
        } else {
          console.log('Alerta creada exitosamente en la base de datos');
        }
      } catch (error) {
        console.error('Error al insertar alerta:', error);
      }
    }
  };

  const fetchUmbrales = async () => {
    try {
      const { data, error } = await supabase
        .from('umbrales_tina')
        .select('*');

      if (error) throw error;
      console.log('Umbrales cargados:', data);
      setUmbrales(data || []);
    } catch (error) {
      console.error('Error fetching umbrales:', error);
    }
  };

  const fetchAlertas = async () => {
    try {
      const { data: alertas, error } = await supabase
        .from('alertas')
        .select('estado, tina_id');

      if (error) throw error;

      const stats = alertas?.reduce((acc, alerta) => {
        acc.total++;
        if (alerta.estado === 'activa') acc.activas++;
        if (alerta.estado === 'resuelta') acc.resueltas++;
        return acc;
      }, { total: 0, activas: 0, resueltas: 0 }) || { total: 0, activas: 0, resueltas: 0 };

      // Contar alertas activas por tina
      const alertasPorTinaCount = alertas?.reduce((acc, alerta) => {
        if (alerta.estado === 'activa') {
          acc[alerta.tina_id] = (acc[alerta.tina_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      setAlertasStats(stats);
      setAlertasPorTina(alertasPorTinaCount);
    } catch (error) {
      console.error('Error fetching alertas stats:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Obteniendo datos de tinas y lecturas...');
      
      const { data: tinasData, error: tinasError } = await supabase
        .from('tinas')
        .select('id, nombre, sensor_id, capacidad, estado, tipo_agave')
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
      
      // Fetch umbrales y alertas stats
      await fetchUmbrales();
      await fetchAlertas();
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
      .channel('dashboard-changes')
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
              
              // Verificar umbrales para esta nueva lectura
              if (umbrales.length > 0) {
                verificarUmbrales(newLectura, tina);
              }
              
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
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alertas'
        },
        () => {
          console.log('Nueva alerta detectada, actualizando stats...');
          fetchAlertas();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alertas'
        },
        () => {
          console.log('Alerta actualizada, actualizando stats...');
          fetchAlertas();
        }
      )
      .subscribe((status) => {
        console.log('Estado de suscripción realtime:', status);
      });

    return () => {
      console.log('Limpiando suscripción realtime...');
      supabase.removeChannel(channel);
    };
  }, [toast, umbrales]);

  const getLecturasPorTina = (tinaId: string): LecturaConTina[] => {
    const tina = tinas.find(t => t.id === tinaId);
    if (!tina || !tina.sensor_id) return [];
    
    return lecturas.filter(lectura => lectura.sensor_id === tina.sensor_id);
  };

  const getEstadisticas = () => {
    const totalTinas = tinas.length;
    const tinasConDatos = tinas.filter(tina => getLecturasPorTina(tina.id).length > 0).length;
    const totalLecturas = lecturas.length;
    
    return { 
      totalTinas, 
      tinasConDatos, 
      totalLecturas,
      alertasActivas: alertasStats.activas,
      totalAlertas: alertasStats.total
    };
  };

  return {
    tinas,
    lecturas,
    alertasStats,
    alertasPorTina,
    loading,
    getLecturasPorTina,
    getEstadisticas
  };
};
