import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Use refs to store the latest values to avoid stale closures in real-time subscriptions
  const umbralesRef = useRef<UmbralTina[]>([]);
  const tinasRef = useRef<Tina[]>([]);

  // Update refs whenever state changes
  useEffect(() => {
    umbralesRef.current = umbrales;
  }, [umbrales]);

  useEffect(() => {
    tinasRef.current = tinas;
  }, [tinas]);

  const validarUmbralesYGenerarAlertas = useCallback(async (lectura: Lectura, tina: Tina) => {
    console.log('🔍 Validando umbrales para lectura:', lectura.id, 'en tina:', tina.nombre);
    
    // Use the ref to get the most current umbrales
    const currentUmbrales = umbralesRef.current;
    const umbralTina = currentUmbrales.find(u => u.tina_id === tina.id);
    
    if (!umbralTina) {
      console.log('❌ No se encontraron umbrales para la tina:', tina.nombre);
      return;
    }

    console.log('✅ Umbrales encontrados para tina:', tina.nombre, umbralTina);
    
    const alertasAGenerar = [];

    // Validar pH
    if (lectura.pH !== null && lectura.pH !== undefined) {
      if (umbralTina.ph_max !== null && lectura.pH > umbralTina.ph_max) {
        alertasAGenerar.push({
          tipo: 'ph_alto',
          mensaje: `pH ALTO en ${tina.nombre}: ${lectura.pH} > ${umbralTina.ph_max}`,
          valor_actual: lectura.pH,
          valor_umbral: umbralTina.ph_max
        });
      }
      if (umbralTina.ph_min !== null && lectura.pH < umbralTina.ph_min) {
        alertasAGenerar.push({
          tipo: 'ph_bajo',
          mensaje: `pH BAJO en ${tina.nombre}: ${lectura.pH} < ${umbralTina.ph_min}`,
          valor_actual: lectura.pH,
          valor_umbral: umbralTina.ph_min
        });
      }
    }

    // Validar temperatura
    if (lectura.temperatura !== null && lectura.temperatura !== undefined) {
      if (umbralTina.temperatura_max !== null && lectura.temperatura > umbralTina.temperatura_max) {
        alertasAGenerar.push({
          tipo: 'temperatura_alta',
          mensaje: `TEMPERATURA ALTA en ${tina.nombre}: ${lectura.temperatura}°C > ${umbralTina.temperatura_max}°C`,
          valor_actual: lectura.temperatura,
          valor_umbral: umbralTina.temperatura_max
        });
      }
      if (umbralTina.temperatura_min !== null && lectura.temperatura < umbralTina.temperatura_min) {
        alertasAGenerar.push({
          tipo: 'temperatura_baja',
          mensaje: `TEMPERATURA BAJA en ${tina.nombre}: ${lectura.temperatura}°C < ${umbralTina.temperatura_min}°C`,
          valor_actual: lectura.temperatura,
          valor_umbral: umbralTina.temperatura_min
        });
      }
    }

    // Validar humedad
    if (lectura.humedad !== null && lectura.humedad !== undefined) {
      if (umbralTina.humedad_max !== null && lectura.humedad > umbralTina.humedad_max) {
        alertasAGenerar.push({
          tipo: 'humedad_alta',
          mensaje: `HUMEDAD ALTA en ${tina.nombre}: ${lectura.humedad}% > ${umbralTina.humedad_max}%`,
          valor_actual: lectura.humedad,
          valor_umbral: umbralTina.humedad_max
        });
      }
      if (umbralTina.humedad_min !== null && lectura.humedad < umbralTina.humedad_min) {
        alertasAGenerar.push({
          tipo: 'humedad_baja',
          mensaje: `HUMEDAD BAJA en ${tina.nombre}: ${lectura.humedad}% < ${umbralTina.humedad_min}%`,
          valor_actual: lectura.humedad,
          valor_umbral: umbralTina.humedad_min
        });
      }
    }

    console.log(`🚨 Se encontraron ${alertasAGenerar.length} alertas para generar`);

    // Generar y guardar las alertas
    for (const alerta of alertasAGenerar) {
      console.log('🚨 Generando alerta:', alerta);
      
      // Mostrar toast inmediatamente
      toast({
        variant: "destructive",
        title: "⚠️ ALERTA CRÍTICA",
        description: alerta.mensaje,
        duration: 8000,
      });

      // Guardar la alerta en la base de datos
      try {
        const { data, error } = await supabase
          .from('alertas')
          .insert({
            tina_id: tina.id,
            tipo_alerta: alerta.tipo,
            valor_actual: alerta.valor_actual,
            valor_umbral: alerta.valor_umbral,
            mensaje: alerta.mensaje,
            lectura_id: lectura.id,
            estado: 'activa'
          })
          .select();

        if (error) {
          console.error('❌ Error guardando alerta:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: `No se pudo guardar la alerta: ${error.message}`,
          });
        } else {
          console.log('✅ Alerta guardada exitosamente:', data);
        }
      } catch (error) {
        console.error('❌ Error al insertar alerta:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al guardar la alerta en la base de datos",
        });
      }
    }
  }, [toast]);

  const fetchUmbrales = async () => {
    try {
      console.log('📊 Cargando umbrales...');
      const { data, error } = await supabase
        .from('umbrales_tina')
        .select('*');

      if (error) throw error;
      console.log('✅ Umbrales cargados:', data?.length || 0, 'registros');
      setUmbrales(data || []);
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching umbrales:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los umbrales."
      });
      return [];
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
      console.error('❌ Error fetching alertas stats:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Obteniendo datos de tinas y lecturas...');
      
      // 1. Fetch tinas first
      const { data: tinasData, error: tinasError } = await supabase
        .from('tinas')
        .select('id, nombre, sensor_id, capacidad, estado, tipo_agave')
        .not('sensor_id', 'is', null);

      if (tinasError) throw tinasError;
      console.log('✅ Tinas obtenidas:', tinasData?.length || 0);

      // 2. Fetch umbrales
      const umbralesData = await fetchUmbrales();
      
      // 3. Fetch lecturas
      if (tinasData && tinasData.length > 0) {
        const sensorIds = tinasData.map(tina => tina.sensor_id).filter(Boolean);
        console.log('🔍 Sensor IDs encontrados:', sensorIds);
        
        const { data: lecturasData, error: lecturasError } = await supabase
          .from('lectura')
          .select('*')
          .in('sensor_id', sensorIds)
          .order('created_at', { ascending: false })
          .limit(1000);

        if (lecturasError) throw lecturasError;

        console.log('✅ Lecturas obtenidas:', lecturasData?.length || 0);

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
      
      // 4. Fetch alertas stats
      await fetchAlertas();

      console.log('✅ Datos iniciales cargados completamente');
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard."
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Real-time subscriptions - separate from data loading
  useEffect(() => {
    console.log('🔄 Configurando suscripción de realtime...');
    
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lectura'
        },
        async (payload) => {
          console.log('📥 Nueva lectura insertada (realtime):', payload);
          const newLectura = payload.new as Lectura;
          
          // Get current tinas from ref to avoid stale closure
          const currentTinas = tinasRef.current;
          const tina = currentTinas.find(t => t.sensor_id === newLectura.sensor_id);
          
          if (tina) {
            const lecturaConTina: LecturaConTina = {
              ...newLectura,
              tina_nombre: tina.nombre
            };
            
            // Update lecturas state
            setLecturas(prevLecturas => {
              console.log('📝 Agregando nueva lectura a la lista');
              return [lecturaConTina, ...prevLecturas];
            });
            
            // Show new reading toast
            toast({
              title: "Nueva lectura",
              description: `Se registró una nueva lectura en ${tina.nombre}`,
            });
            
            // VALIDATE THRESHOLDS IMMEDIATELY when new reading arrives
            console.log('🔍 Iniciando validación de umbrales para nueva lectura...');
            try {
              await validarUmbralesYGenerarAlertas(newLectura, tina);
            } catch (error) {
              console.error('❌ Error al validar umbrales:', error);
            }
          } else {
            console.log('❌ No se encontró tina para sensor_id:', newLectura.sensor_id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lectura'
        },
        async (payload) => {
          console.log('📝 Lectura actualizada (realtime):', payload);
          const updatedLectura = payload.new as Lectura;
          
          const currentTinas = tinasRef.current;
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
            
            // VALIDATE THRESHOLDS for updated readings too
            console.log('🔍 Validando umbrales para lectura actualizada...');
            try {
              await validarUmbralesYGenerarAlertas(updatedLectura, tina);
            } catch (error) {
              console.error('❌ Error al validar umbrales:', error);
            }
          }
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
          console.log('🚨 Nueva alerta detectada, actualizando stats...');
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
          console.log('📝 Alerta actualizada, actualizando stats...');
          fetchAlertas();
        }
      )
      .subscribe((status) => {
        console.log('🔌 Estado de suscripción realtime:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscripción realtime activa');
        }
      });

    return () => {
      console.log('🔌 Limpiando suscripción realtime...');
      supabase.removeChannel(channel);
    };
  }, [toast, validarUmbralesYGenerarAlertas]); // Remove umbrales from dependencies

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
    umbrales,
    alertasStats,
    alertasPorTina,
    loading,
    getLecturasPorTina,
    getEstadisticas,
    // Expose for debugging
    validarUmbralesYGenerarAlertas
  };
};