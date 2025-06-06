
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DashboardNavigation from '@/components/DashboardNavigation';
import { AlertsList } from '@/components/AlertsList';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AlertasManagement = () => {
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    console.log('Setting up realtime subscription for alert management...');
    
    const channel = supabase
      .channel('alert-management-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alertas'
        },
        (payload) => {
          console.log('Nueva alerta detectada en la página de gestión:', payload);
          toast({
            title: "Nueva alerta crítica detectada",
            description: "Se ha generado una nueva alerta en el sistema.",
            variant: "destructive"
          });
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe((status) => {
        console.log('Estado de suscripción realtime para gestión de alertas:', status);
      });

    return () => {
      console.log('Limpiando suscripción realtime...');
      supabase.removeChannel(channel);
    };
  }, [userRole, loading, navigate, toast]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <DashboardNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNavigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <CardTitle>Gestión de Alertas</CardTitle>
                  <CardDescription>
                    Monitorea y gestiona las alertas generadas por los umbrales de las tinas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AlertsList key={refreshTrigger} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AlertasManagement;
