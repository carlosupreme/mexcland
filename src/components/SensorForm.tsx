
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Sensor {
  id: string;
  device_id: string | null;
  estado: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface SensorFormProps {
  sensor: Sensor | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export const SensorForm = ({ sensor, onSubmit, onCancel }: SensorFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    device_id: '',
    estado: 'Desconectado' as string
  });

  useEffect(() => {
    if (sensor) {
      setFormData({
        device_id: sensor.device_id || '',
        estado: sensor.estado || 'Desconectado'
      });
    }
  }, [sensor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sensorData = {
        device_id: formData.device_id || null,
        estado: formData.estado,
        updated_by: user?.id || null
      };

      if (sensor) {
        // Actualizar sensor existente
        const { error } = await supabase
          .from('sensores')
          .update(sensorData)
          .eq('id', sensor.id);

        if (error) throw error;

        toast({
          title: "Sensor actualizado",
          description: "El sensor ha sido actualizado exitosamente."
        });
      } else {
        // Crear nuevo sensor
        const { error } = await supabase
          .from('sensores')
          .insert({
            ...sensorData,
            created_by: user?.id || null
          });

        if (error) throw error;

        toast({
          title: "Sensor creado",
          description: "El sensor ha sido creado exitosamente."
        });
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving sensor:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: sensor ? "No se pudo actualizar el sensor." : "No se pudo crear el sensor."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{sensor ? 'Editar Sensor' : 'Nuevo Sensor'}</CardTitle>
          <CardDescription>
            {sensor ? 'Modifica los datos del sensor' : 'Crear un nuevo sensor en el sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="device_id">Device ID</Label>
              <Input
                id="device_id"
                value={formData.device_id}
                onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                placeholder="Ej: SENSOR-001"
              />
            </div>

            <div>
              <Label>Estado</Label>
              <RadioGroup
                value={formData.estado}
                onValueChange={(value) => setFormData({...formData, estado: value})}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Conectado" id="conectado" />
                  <Label htmlFor="conectado">Conectado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Desconectado" id="desconectado" />
                  <Label htmlFor="desconectado">Desconectado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Disponible" id="disponible" />
                  <Label htmlFor="disponible">Disponible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="En uso" id="en-uso" />
                  <Label htmlFor="en-uso">En uso</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Guardando...' : (sensor ? 'Actualizar' : 'Crear')}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
