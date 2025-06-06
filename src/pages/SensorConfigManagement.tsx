
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SensorConfigTable } from '@/components/SensorConfigTable';
import { SensorConfigForm } from '@/components/SensorConfigForm';
import DashboardNavigation from '@/components/DashboardNavigation';

interface Sensor {
  id: string;
  device_id: string | null;
  estado: string | null;
}

interface SensorConfig {
  id: string;
  sensor_id: string | null;
  device_id: string | null;
  frecuencia_actualizacion: number | null;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  sensor?: Sensor;
}

const SensorConfigManagement = () => {
  const { userRole, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [configuraciones, setConfiguraciones] = useState<SensorConfig[]>([]);
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SensorConfig | null>(null);

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    if (userRole === 'admin') {
      fetchConfiguraciones();
      fetchSensores();
    }
  }, [userRole, loading, navigate]);

  const fetchConfiguraciones = async () => {
    try {
      console.log('Iniciando fetchConfiguraciones...');
      setLoadingConfig(true);
      
      // Obtener configuraciones con JOIN a sensores
      const { data: configData, error: configError } = await supabase
        .from('configuraciones')
        .select(`
          *,
          sensor:sensores(id, device_id, estado)
        `)
        .order('created_at', { ascending: false });

      console.log('Configuraciones obtenidas:', configData);
      console.log('Error en configuraciones:', configError);

      if (configError) {
        console.error('Error en configuraciones:', configError);
        throw configError;
      }

      setConfiguraciones(configData || []);
    } catch (error) {
      console.error('Error fetching configuraciones:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las configuraciones."
      });
      setConfiguraciones([]);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchSensores = async () => {
    try {
      const { data, error } = await supabase
        .from('sensores')
        .select('id, device_id, estado')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSensores(data || []);
    } catch (error) {
      console.error('Error fetching sensores:', error);
    }
  };

  const handleEdit = (config: SensorConfig) => {
    setEditingConfig(config);
    setShowForm(true);
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('configuraciones')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      toast({
        title: "Configuración eliminada",
        description: "La configuración ha sido eliminada exitosamente."
      });
      
      fetchConfiguraciones();
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la configuración."
      });
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingConfig(null);
    fetchConfiguraciones();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingConfig(null);
  };

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
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/sensores')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Volver a Sensores
                  </Button>
                  <div>
                    <CardTitle>Configuraciones de Sensores</CardTitle>
                    <CardDescription>
                      Gestiona las configuraciones de los sensores del sistema
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                  <Plus size={16} />
                  Nueva Configuración
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SensorConfigTable
                configuraciones={configuraciones}
                loading={loadingConfig}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>

          {showForm && (
            <SensorConfigForm
              config={editingConfig}
              sensores={sensores}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SensorConfigManagement;
