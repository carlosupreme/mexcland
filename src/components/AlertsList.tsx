
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Eye, Clock, RefreshCw } from 'lucide-react';

interface Alerta {
  id: string;
  tina_id: string;
  tipo_alerta: string;
  valor_actual: number;
  valor_umbral: number;
  mensaje: string;
  estado: string;
  created_at: string;
  tinas?: {
    nombre: string;
  };
}

interface AlertsListProps {
  limit?: number;
  showActions?: boolean;
}

export const AlertsList = ({ limit, showActions = true }: AlertsListProps) => {
  const { toast } = useToast();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleManualRefresh = () => {
    console.log('Actualizando manualmente la lista de alertas...');
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    fetchAlertas();
    
    // Suscribirse a nuevas alertas en tiempo real
    console.log('Setting up realtime subscription for alerts...');
    const channel = supabase
      .channel('alertas-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alertas'
        },
        (payload) => {
          console.log('Nueva alerta detectada:', payload);
          const newAlerta = payload.new as Alerta;
          
          // Buscar la información de la tina para la nueva alerta
          fetchTinaInfo(newAlerta.tina_id).then((tinaInfo) => {
            const alertaConTina = {
              ...newAlerta,
              tinas: tinaInfo
            };
            
            setAlertas(prev => [alertaConTina, ...prev]);
            
            toast({
              title: "⚠️ Nueva Alerta Crítica",
              description: `${tinaInfo?.nombre || 'Tina desconocida'}: ${newAlerta.tipo_alerta}`,
              variant: "destructive"
            });
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alertas'
        },
        (payload) => {
          console.log('Alerta actualizada:', payload);
          const updatedAlerta = payload.new as Alerta;
          
          setAlertas(prev =>
            prev.map(alerta =>
              alerta.id === updatedAlerta.id 
                ? { ...alerta, ...updatedAlerta }
                : alerta
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('Alert subscription status:', status);
      });

    return () => {
      console.log('Cleaning up alert subscription...');
      supabase.removeChannel(channel);
    };
  }, [toast, refreshKey]);

  const fetchTinaInfo = async (tinaId: string) => {
    try {
      const { data } = await supabase
        .from('tinas')
        .select('nombre')
        .eq('id', tinaId)
        .single();
      return data;
    } catch (error) {
      console.error('Error fetching tina info:', error);
      return null;
    }
  };

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('alertas')
        .select(`
          *,
          tinas:tina_id (
            nombre
          )
        `)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      } else {
        query = query.limit(50);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log('Alertas cargadas:', data?.length || 0, data);
      setAlertas(data || []);
    } catch (error) {
      console.error('Error fetching alertas:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las alertas."
      });
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (alertaId: string) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .update({ estado: 'leida' })
        .eq('id', alertaId);

      if (error) throw error;
      
      toast({
        title: "Alerta marcada como leída",
        description: "La alerta ha sido marcada como leída."
      });
    } catch (error) {
      console.error('Error updating alerta:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la alerta."
      });
    }
  };

  const marcarComoResuelta = async (alertaId: string) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .update({ estado: 'resuelta' })
        .eq('id', alertaId);

      if (error) throw error;
      
      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta."
      });
    } catch (error) {
      console.error('Error updating alerta:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la alerta."
      });
    }
  };

  const getAlertaBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'destructive';
      case 'leida':
        return 'secondary';
      case 'resuelta':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getTipoAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'ph_alto':
      case 'ph_bajo':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'temperatura_alta':
      case 'temperatura_baja':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'humedad_alta':
      case 'humedad_baja':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTipoAlertaLabel = (tipo: string) => {
    switch (tipo) {
      case 'ph_alto':
        return 'pH Alto';
      case 'ph_bajo':
        return 'pH Bajo';
      case 'temperatura_alta':
        return 'Temperatura Alta';
      case 'temperatura_baja':
        return 'Temperatura Baja';
      case 'humedad_alta':
        return 'Humedad Alta';
      case 'humedad_baja':
        return 'Humedad Baja';
      default:
        return tipo;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-muted-foreground">Cargando alertas...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleManualRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Actualizar
        </Button>
      </div>
      
      <div className="space-y-4">
        {alertas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No hay alertas registradas.</p>
            <p className="text-sm">Las alertas aparecerán aquí cuando los valores sobrepasen los umbrales configurados.</p>
          </div>
        ) : (
          alertas.map((alerta) => (
            <Card 
              key={alerta.id} 
              className={`${
                alerta.estado === 'activa' 
                  ? 'border-red-200 bg-red-50 shadow-md' 
                  : alerta.estado === 'leida'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-green-200 bg-green-50'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTipoAlertaIcon(alerta.tipo_alerta)}
                    <div>
                      <CardTitle className="text-base">
                        {alerta.tinas?.nombre || 'Tina desconocida'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{getTipoAlertaLabel(alerta.tipo_alerta)}</span>
                        <Badge variant={getAlertaBadgeVariant(alerta.estado)}>
                          {alerta.estado}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(alerta.created_at)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm font-medium">{alerta.mensaje}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground bg-gray-100 p-2 rounded">
                    <span className="font-medium">Valor actual: {alerta.valor_actual}</span>
                    <span className="font-medium">Umbral: {alerta.valor_umbral}</span>
                  </div>
    
                  {showActions && (
                    <>
                      {alerta.estado === 'activa' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarComoLeida(alerta.id)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Marcar como leída
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => marcarComoResuelta(alerta.id)}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Resolver
                          </Button>
                        </div>
                      )}
    
                      {alerta.estado === 'leida' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => marcarComoResuelta(alerta.id)}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Resolver
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
};
