
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

interface SensorConfigFormProps {
  config: SensorConfig | null;
  sensores: Sensor[];
  onSubmit: () => void;
  onCancel: () => void;
}

export const SensorConfigForm = ({ config, sensores, onSubmit, onCancel }: SensorConfigFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sensor_id: '',
    device_id: '',
    frecuencia_actualizacion: ''
  });

  useEffect(() => {
    if (config) {
      setFormData({
        sensor_id: config.sensor_id || '',
        device_id: config.device_id || '',
        frecuencia_actualizacion: config.frecuencia_actualizacion?.toString() || ''
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const configData = {
        sensor_id: formData.sensor_id || null,
        device_id: formData.device_id || null,
        frecuencia_actualizacion: formData.frecuencia_actualizacion ? parseInt(formData.frecuencia_actualizacion) : null,
        updated_by: user?.id || null
      };

      if (config) {
        // Actualizar configuración existente
        const { error } = await supabase
          .from('configuraciones')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;

        toast({
          title: "Configuración actualizada",
          description: "La configuración ha sido actualizada exitosamente."
        });
      } else {
        // Crear nueva configuración
        const { error } = await supabase
          .from('configuraciones')
          .insert({
            ...configData,
            created_by: user?.id || null
          });

        if (error) throw error;

        toast({
          title: "Configuración creada",
          description: "La configuración ha sido creada exitosamente."
        });
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: config ? "No se pudo actualizar la configuración." : "No se pudo crear la configuración."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{config ? 'Editar Configuración' : 'Nueva Configuración'}</CardTitle>
          <CardDescription>
            {config ? 'Modifica los datos de la configuración' : 'Crear una nueva configuración para un sensor'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="sensor_id">Sensor</Label>
              <Select
                value={formData.sensor_id}
                onValueChange={(value) => setFormData({...formData, sensor_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un sensor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin sensor</SelectItem>
                  {sensores.map((sensor) => (
                    <SelectItem key={sensor.id} value={sensor.id}>
                      {sensor.device_id || sensor.id.substring(0, 8) + '...'} - {sensor.estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="device_id">Device ID</Label>
              <Input
                id="device_id"
                value={formData.device_id}
                onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                placeholder="Ej: CONFIG-001"
              />
            </div>

            <div>
              <Label htmlFor="frecuencia_actualizacion">Frecuencia de Actualización (minutos)</Label>
              <Input
                id="frecuencia_actualizacion"
                type="number"
                min="1"
                value={formData.frecuencia_actualizacion}
                onChange={(e) => setFormData({...formData, frecuencia_actualizacion: e.target.value})}
                placeholder="Ej: 5"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Guardando...' : (config ? 'Actualizar' : 'Crear')}
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
