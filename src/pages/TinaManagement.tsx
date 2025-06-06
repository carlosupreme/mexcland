
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { TinaTable } from '@/components/TinaTable';
import { TinaForm } from '@/components/TinaForm';
import { Plus } from 'lucide-react';

interface Tina {
  id: string;
  nombre: string;
  capacidad: number;
  estado: string;
  tipo_agave: string | null;
  sensor_id: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  ultima_actualizacion: string | null;
  created_by: string | null;
  updated_by: string | null;
}

const TinaManagement = () => {
  const { userRole, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tinas, setTinas] = useState<Tina[]>([]);
  const [loadingTinas, setLoadingTinas] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTina, setEditingTina] = useState<Tina | null>(null);

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    if (userRole === 'admin') {
      fetchTinas();
    }
  }, [userRole, loading, navigate]);

  const fetchTinas = async () => {
    setLoadingTinas(true);
    try {
      const { data, error } = await supabase
        .from('tinas')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setTinas(data || []);
    } catch (error) {
      console.error('Error fetching tinas:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las tinas."
      });
    } finally {
      setLoadingTinas(false);
    }
  };

  const handleCreateTina = () => {
    setEditingTina(null);
    setShowForm(true);
  };

  const handleEditTina = (tina: Tina) => {
    setEditingTina(tina);
    setShowForm(true);
  };

  const handleDeleteTina = async (tinaId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tina?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tinas')
        .delete()
        .eq('id', tinaId);

      if (error) throw error;

      toast({
        title: "Tina eliminada",
        description: "La tina ha sido eliminada exitosamente."
      });

      fetchTinas();
    } catch (error) {
      console.error('Error deleting tina:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la tina."
      });
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingTina(null);
    fetchTinas();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTina(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestión de Tinas</CardTitle>
              <CardDescription>
                Administra las tinas del sistema de fermentación
              </CardDescription>
            </div>
            <Button onClick={handleCreateTina} className="flex items-center gap-2">
              <Plus size={16} />
              Nueva Tina
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TinaTable
            tinas={tinas}
            loading={loadingTinas}
            onEdit={handleEditTina}
            onDelete={handleDeleteTina}
          />
        </CardContent>
      </Card>

      {showForm && (
        <TinaForm
          tina={editingTina}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default TinaManagement;
