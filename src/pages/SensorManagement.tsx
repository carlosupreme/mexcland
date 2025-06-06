
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SensorTable } from '@/components/SensorTable';
import { SensorForm } from '@/components/SensorForm';
import DashboardNavigation from '@/components/DashboardNavigation';

interface Sensor {
  id: string;
  device_id: string | null;
  estado: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

const SensorManagement = () => {
  const { userRole, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loadingSensores, setLoadingSensores] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    if (userRole === 'admin') {
      fetchSensores();
    }
  }, [userRole, loading, navigate]);

  const fetchSensores = async () => {
    try {
      setLoadingSensores(true);
      const { data, error } = await supabase
        .from('sensores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSensores(data || []);
    } catch (error) {
      console.error('Error fetching sensores:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los sensores."
      });
    } finally {
      setLoadingSensores(false);
    }
  };

  const handleEdit = (sensor: Sensor) => {
    setEditingSensor(sensor);
    setShowForm(true);
  };

  const handleDelete = async (sensorId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este sensor?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sensores')
        .delete()
        .eq('id', sensorId);

      if (error) throw error;

      toast({
        title: "Sensor eliminado",
        description: "El sensor ha sido eliminado exitosamente."
      });
      
      fetchSensores();
    } catch (error) {
      console.error('Error deleting sensor:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el sensor."
      });
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingSensor(null);
    fetchSensores();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSensor(null);
  };

  const handleNavigateToConfig = () => {
    navigate('/sensor-config');
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
                <div>
                  <CardTitle>Gestión de Sensores</CardTitle>
                  <CardDescription>
                    Administra los sensores del sistema de monitoreo
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleNavigateToConfig}
                    className="flex items-center gap-2"
                  >
                    Configuraciones
                  </Button>
                  <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                    <Plus size={16} />
                    Nuevo Sensor
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SensorTable
                sensores={sensores}
                loading={loadingSensores}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>

          {showForm && (
            <SensorForm
              sensor={editingSensor}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SensorManagement;
