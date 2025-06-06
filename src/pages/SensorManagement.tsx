
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SensorTable } from '@/components/SensorTable';
import { SensorForm } from '@/components/SensorForm';

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
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);

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
        description: "Solo los administradores pueden gestionar sensores."
      });
      return;
    }
  }, [user, userRole, navigate, toast]);

  const fetchSensores = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchSensores();
    }
  }, [user, userRole]);

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
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Sensores</h1>
              <p className="text-gray-600">Administra los sensores del sistema</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Nuevo Sensor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Sensores</CardTitle>
            <CardDescription>
              Todos los sensores registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SensorTable
              sensores={sensores}
              loading={loading}
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
  );
};

export default SensorManagement;
