
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

interface Sensor {
  id: string;
  device_id: string | null;
  estado: string;
}

interface TinaFormProps {
  tina: Tina | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export const TinaForm = ({ tina, onSubmit, onCancel }: TinaFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sensoresDisponibles, setSensoresDisponibles] = useState<Sensor[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: 0,
    estado: 'Disponible' as string,
    tipo_agave: '',
    sensor_id: 'no-sensor'
  });

  useEffect(() => {
    if (tina) {
      setFormData({
        nombre: tina.nombre,
        capacidad: tina.capacidad,
        estado: tina.estado,
        tipo_agave: tina.tipo_agave || '',
        sensor_id: tina.sensor_id || 'no-sensor'
      });
    }
    fetchSensoresDisponibles();
  }, [tina]);

  const fetchSensoresDisponibles = async () => {
    try {
      // Obtenemos todos los sensores
      const { data: sensores, error: sensoresError } = await supabase
        .from('sensores')
        .select('id, device_id, estado')
        .order('device_id', { ascending: true });

      if (sensoresError) throw sensoresError;

      // Obtenemos las tinas que tienen sensores asignados (excluyendo la tina actual si estamos editando)
      let query = supabase
        .from('tinas')
        .select('sensor_id')
        .not('sensor_id', 'is', null);
      
      if (tina) {
        query = query.neq('id', tina.id);
      }

      const { data: tinasConSensores, error: tinasError } = await query;

      if (tinasError) throw tinasError;

      // Filtramos los sensores que no están asignados a otras tinas
      const sensoresAsignados = tinasConSensores?.map(t => t.sensor_id) || [];
      const sensoresLibres = sensores?.filter(sensor => 
        !sensoresAsignados.includes(sensor.id)
      ) || [];

      // Si estamos editando y la tina ya tiene un sensor, lo incluimos
      if (tina && tina.sensor_id) {
        const sensorActual = sensores?.find(s => s.id === tina.sensor_id);
        if (sensorActual && !sensoresLibres.find(s => s.id === sensorActual.id)) {
          sensoresLibres.push(sensorActual);
        }
      }

      setSensoresDisponibles(sensoresLibres);
    } catch (error) {
      console.error('Error fetching sensores:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los sensores disponibles."
      });
    }
  };

  const getSensorDisplay = (sensor: Sensor) => {
    if (sensor.device_id) {
      return sensor.device_id;
    }
    return sensor.id.substring(0, 8) + '...';
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Conectado':
        return 'default';
      case 'Desconectado':
        return 'secondary';
      case 'Disponible':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tinaData = {
        nombre: formData.nombre,
        capacidad: formData.capacidad,
        estado: formData.estado,
        tipo_agave: formData.tipo_agave || null,
        sensor_id: formData.sensor_id === 'no-sensor' ? null : formData.sensor_id,
        updated_by: user?.id || null
      };

      if (tina) {
        // Actualizar tina existente
        const { error } = await supabase
          .from('tinas')
          .update(tinaData)
          .eq('id', tina.id);

        if (error) throw error;

        toast({
          title: "Tina actualizada",
          description: "La tina ha sido actualizada exitosamente."
        });
      } else {
        // Crear nueva tina
        const { error } = await supabase
          .from('tinas')
          .insert({
            ...tinaData,
            created_by: user?.id || null
          });

        if (error) throw error;

        toast({
          title: "Tina creada",
          description: "La tina ha sido creada exitosamente."
        });
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving tina:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: tina ? "No se pudo actualizar la tina." : "No se pudo crear la tina."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{tina ? 'Editar Tina' : 'Nueva Tina'}</CardTitle>
          <CardDescription>
            {tina ? 'Modifica los datos de la tina' : 'Crear una nueva tina en el sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Tina</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
                placeholder="Ej: Tina-001"
              />
            </div>

            <div>
              <Label htmlFor="capacidad">Capacidad (Litros)</Label>
              <Input
                id="capacidad"
                type="number"
                min="1"
                value={formData.capacidad}
                onChange={(e) => setFormData({...formData, capacidad: parseInt(e.target.value) || 0})}
                required
                placeholder="Ej: 1000"
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
                  <RadioGroupItem value="Disponible" id="disponible" />
                  <Label htmlFor="disponible">Disponible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="En uso" id="en-uso" />
                  <Label htmlFor="en-uso">En uso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Mantenimiento" id="mantenimiento" />
                  <Label htmlFor="mantenimiento">Mantenimiento</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="tipo_agave">Tipo de Agave</Label>
              <Input
                id="tipo_agave"
                value={formData.tipo_agave}
                onChange={(e) => setFormData({...formData, tipo_agave: e.target.value})}
                placeholder="Ej: Azul Weber"
              />
            </div>

            <div>
              <Label htmlFor="sensor_id">Sensor Asignado</Label>
              <Select
                value={formData.sensor_id}
                onValueChange={(value) => setFormData({...formData, sensor_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sensor (opcional)" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="no-sensor">Sin sensor</SelectItem>
                  {sensoresDisponibles.map((sensor) => (
                    <SelectItem key={sensor.id} value={sensor.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">
                          {getSensorDisplay(sensor)}
                        </span>
                        <Badge 
                          variant={getEstadoBadgeVariant(sensor.estado)}
                          className="ml-2"
                        >
                          {sensor.estado}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sensoresDisponibles.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  No hay sensores disponibles para asignar
                </p>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Guardando...' : (tina ? 'Actualizar' : 'Crear')}
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
