
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';

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

export const AlertsList = () => {
  const { toast } = useToast();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlertas();
    
    // Suscribirse a nuevas alertas en tiempo real
    const channel = supabase
      .channel('alertas-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alertas'
        },
        (payload) => {
          console.log('Nueva alerta:', payload);
          fetchAlertas(); // Recargar alertas cuando se inserte una nueva
          
          toast({
            title: "Nueva Alerta",
            description: "Se ha generado una nueva alerta en el sistema",
            variant: "destructive"
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alertas')
        .select(`
          *,
          tinas:tina_id (
            nombre
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
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
      
      // Actualizar el estado local
      setAlertas(prev => 
        prev.map(alerta => 
          alerta.id === alertaId 
            ? { ...alerta, estado: 'leida' }
            : alerta
        )
      );

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
      
      // Actualizar el estado local
      setAlertas(prev => 
        prev.map(alerta => 
          alerta.id === alertaId 
            ? { ...alerta, estado: 'resuelta' }
            : alerta
        )
      );

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
    return <AlertTriangle className="w-4 h-4" />;
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

  if (alertas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay alertas registradas.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alertas.map((alerta) => (
        <Card key={alerta.id} className={`${alerta.estado === 'activa' ? 'border-red-200 bg-red-50' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getTipoAlertaIcon(alerta.tipo_alerta)}
                <CardTitle className="text-base">
                  {alerta.tinas?.nombre || 'Tina desconocida'}
                </CardTitle>
                <Badge variant={getAlertaBadgeVariant(alerta.estado)}>
                  {alerta.estado}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(alerta.created_at)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">{alerta.mensaje}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Valor actual: {alerta.valor_actual}</span>
                <span>Umbral: {alerta.valor_umbral}</span>
                <span>Tipo: {alerta.tipo_alerta}</span>
              </div>

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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
