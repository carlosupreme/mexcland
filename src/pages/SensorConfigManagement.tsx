
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SensorConfigTable } from '@/components/SensorConfigTable';
import { SensorConfigForm } from '@/components/SensorConfigForm';

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
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [configuraciones, setConfiguraciones] = useState<SensorConfig[]>([]);
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SensorConfig | null>(null);

  // Verificar permisos de admin
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (userRole !== 'admin') {
      navigate('/dashboard');
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "Solo los administradores pueden gestionar configuraciones de sensores."
      });
      return;
    }
  }, [user, userRole, navigate, toast]);

  const fetchConfiguraciones = async () => {
    try {
      console.log('Iniciando fetchConfiguraciones...');
      setLoading(true);
      
      // Primero intentemos obtener todas las configuraciones sin el join
      const { data: configData, error: configError } = await supabase
        .from('configuraciones')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Configuraciones obtenidas:', configData);
      console.log('Error en configuraciones:', configError);

      if (configError) {
        console.error('Error en configuraciones:', configError);
        throw configError;
      }

      // Si hay configuraciones, intentamos obtener los sensores relacionados
      if (configData && configData.length > 0) {
        const sensorIds = configData
          .map(config => config.sensor_id)
          .filter(id => id !== null);

        console.log('Sensor IDs encontrados:', sensorIds);

        if (sensorIds.length > 0) {
          const { data: sensoresData, error: sensoresError } = await supabase
            .from('sensores')
            .select('id, device_id, estado')
            .in('id', sensorIds);

          console.log('Sensores obtenidos:', sensoresData);
          console.log('Error en sensores:', sensoresError);

          if (!sensoresError && sensoresData) {
            // Combinar los datos manualmente
            const configuracionesConSensores = configData.map(config => ({
              ...config,
              sensor: config.sensor_id 
                ? sensoresData.find(sensor => sensor.id === config.sensor_id) 
                : null
            }));
            
            console.log('Configuraciones con sensores:', configuracionesConSensores);
            setConfiguraciones(configuracionesConSensores);
          } else {
            setConfiguraciones(configData);
          }
        } else {
          setConfiguraciones(configData);
        }
      } else {
        setConfiguraciones([]);
      }
    } catch (error) {
      console.error('Error fetching configuraciones:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las configuraciones."
      });
      setConfiguraciones([]);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchConfiguraciones();
      fetchSensores();
    }
  }, [user, userRole]);

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

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Configuraciones de Sensores</h1>
              <p className="text-gray-600">Gestiona las configuraciones de los sensores</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            Nueva Configuración
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Configuraciones</CardTitle>
            <CardDescription>
              Todas las configuraciones de sensores registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SensorConfigTable
              configuraciones={configuraciones}
              loading={loading}
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
  );
};

export default SensorConfigManagement;
