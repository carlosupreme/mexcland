
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

interface Umbral {
  ph_min: number | null;
  ph_max: number | null;
  temperatura_min: number | null;
  temperatura_max: number | null;
  humedad_min: number | null;
  humedad_max: number | null;
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
  const [initialized, setInitialized] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: 0,
    estado: 'Disponible' as string,
    tipo_agave: '',
    sensor_id: 'no-sensor'
  });
  
  const [umbrales, setUmbrales] = useState<Umbral>({
    ph_min: null,
    ph_max: null,
    temperatura_min: null,
    temperatura_max: null,
    humedad_min: null,
    humedad_max: null
  });

  // Initialize form data only once when tina prop changes
  useEffect(() => {
    console.log('=== FORM INITIALIZATION START ===');
    console.log('Tina received:', tina);
    
    const initializeForm = async () => {
      setInitialized(false);
      
      if (tina) {
        console.log('Setting form data for editing tina:', tina.nombre);
        
        const newFormData = {
          nombre: tina.nombre || '',
          capacidad: tina.capacidad || 0,
          estado: tina.estado || 'Disponible',
          tipo_agave: tina.tipo_agave || '',
          sensor_id: tina.sensor_id || 'no-sensor'
        };
        
        console.log('New form data being set:', newFormData);
        setFormData(newFormData);
        
        // Fetch thresholds for existing tina
        await fetchUmbrales(tina.id);
      } else {
        console.log('Resetting form for new tina');
        setFormData({
          nombre: '',
          capacidad: 0,
          estado: 'Disponible',
          tipo_agave: '',
          sensor_id: 'no-sensor'
        });
        
        setUmbrales({
          ph_min: null,
          ph_max: null,
          temperatura_min: null,
          temperatura_max: null,
          humedad_min: null,
          humedad_max: null
        });
      }
      
      setInitialized(true);
      console.log('=== FORM INITIALIZATION COMPLETE ===');
    };

    initializeForm();
  }, [tina?.id]); // Only depend on tina.id to avoid unnecessary re-runs

  // Fetch available sensors once on mount
  useEffect(() => {
    console.log('Fetching available sensors...');
    fetchSensoresDisponibles();
  }, []);

  const fetchUmbrales = async (tinaId: string) => {
    try {
      console.log('Fetching umbrales for tina:', tinaId);
      const { data, error } = await supabase
        .from('umbrales_tina')
        .select('*')
        .eq('tina_id', tinaId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        console.log('Found umbrales:', data);
        setUmbrales({
          ph_min: data.ph_min,
          ph_max: data.ph_max,
          temperatura_min: data.temperatura_min,
          temperatura_max: data.temperatura_max,
          humedad_min: data.humedad_min,
          humedad_max: data.humedad_max
        });
      } else {
        console.log('No umbrales found for tina');
      }
    } catch (error) {
      console.error('Error fetching umbrales:', error);
    }
  };

  const fetchSensoresDisponibles = async () => {
    try {
      const { data: sensores, error: sensoresError } = await supabase
        .from('sensores')
        .select('id, device_id, estado')
        .order('device_id', { ascending: true });

      if (sensoresError) throw sensoresError;

      let query = supabase
        .from('tinas')
        .select('sensor_id')
        .not('sensor_id', 'is', null);
      
      if (tina) {
        query = query.neq('id', tina.id);
      }

      const { data: tinasConSensores, error: tinasError } = await query;

      if (tinasError) throw tinasError;

      const sensoresAsignados = tinasConSensores?.map(t => t.sensor_id) || [];
      const sensoresLibres = sensores?.filter(sensor => 
        !sensoresAsignados.includes(sensor.id)
      ) || [];

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

  // Handle form field changes - only update if form is initialized
  const handleFormDataChange = (field: string, value: any) => {
    if (!initialized) {
      console.log('Ignoring form change before initialization:', field, value);
      return;
    }
    
    console.log(`${field} changed to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
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

      let tinaId: string;

      if (tina) {
        // Update existing tina
        const { error } = await supabase
          .from('tinas')
          .update(tinaData)
          .eq('id', tina.id);

        if (error) throw error;
        tinaId = tina.id;

        toast({
          title: "Tina actualizada",
          description: "La tina ha sido actualizada exitosamente."
        });
      } else {
        // Create new tina
        const { data: nuevaTina, error } = await supabase
          .from('tinas')
          .insert({
            ...tinaData,
            created_by: user?.id || null
          })
          .select()
          .single();

        if (error) throw error;
        tinaId = nuevaTina.id;

        toast({
          title: "Tina creada",
          description: "La tina ha sido creada exitosamente."
        });
      }

      // Save or update thresholds if sensor is assigned
      if (formData.sensor_id !== 'no-sensor') {
        const umbralData = {
          tina_id: tinaId,
          ph_min: umbrales.ph_min,
          ph_max: umbrales.ph_max,
          temperatura_min: umbrales.temperatura_min,
          temperatura_max: umbrales.temperatura_max,
          humedad_min: umbrales.humedad_min,
          humedad_max: umbrales.humedad_max,
          updated_by: user?.id || null
        };

        // Check if threshold already exists for this tina
        const { data: umbralExistente } = await supabase
          .from('umbrales_tina')
          .select('id')
          .eq('tina_id', tinaId)
          .single();

        if (umbralExistente) {
          // Update existing threshold
          const { error: umbralError } = await supabase
            .from('umbrales_tina')
            .update(umbralData)
            .eq('tina_id', tinaId);

          if (umbralError) throw umbralError;
        } else {
          // Create new threshold
          const { error: umbralError } = await supabase
            .from('umbrales_tina')
            .insert({
              ...umbralData,
              created_by: user?.id || null
            });

          if (umbralError) throw umbralError;
        }
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

  // Don't render form until it's properly initialized
  if (!initialized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Cargando datos...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{tina ? 'Editar Tina' : 'Nueva Tina'}</CardTitle>
          <CardDescription>
            {tina ? 'Modifica los datos de la tina y sus umbrales de alerta' : 'Crear una nueva tina en el sistema con umbrales de alerta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic tina information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información de la Tina</h3>
              
              <div>
                <Label htmlFor="nombre">Nombre de la Tina</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleFormDataChange('nombre', e.target.value)}
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
                  onChange={(e) => handleFormDataChange('capacidad', parseInt(e.target.value) || 0)}
                  required
                  placeholder="Ej: 1000"
                />
              </div>

              <div>
                <Label>Estado</Label>
                <RadioGroup
                  value={formData.estado}
                  onValueChange={(value) => handleFormDataChange('estado', value)}
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
                  onChange={(e) => handleFormDataChange('tipo_agave', e.target.value)}
                  placeholder="Ej: Azul Weber"
                />
              </div>

              <div>
                <Label htmlFor="sensor_id">Sensor Asignado</Label>
                <Select
                  value={formData.sensor_id}
                  onValueChange={(value) => handleFormDataChange('sensor_id', value)}
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
            </div>

            {/* Alert thresholds */}
            {formData.sensor_id !== 'no-sensor' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Umbrales de Alerta</h3>
                  <p className="text-sm text-muted-foreground">
                    Configura los valores mínimos y máximos para recibir alertas automáticas
                  </p>
                  
                  {/* pH */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ph_min">pH Mínimo</Label>
                      <Input
                        id="ph_min"
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={umbrales.ph_min || ''}
                        onChange={(e) => setUmbrales({...umbrales, ph_min: e.target.value ? parseFloat(e.target.value) : null})}
                        placeholder="Ej: 3.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ph_max">pH Máximo</Label>
                      <Input
                        id="ph_max"
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={umbrales.ph_max || ''}
                        onChange={(e) => setUmbrales({...umbrales, ph_max: e.target.value ? parseFloat(e.target.value) : null})}
                        placeholder="Ej: 4.5"
                      />
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperatura_min">Temperatura Mínima (°C)</Label>
                      <Input
                        id="temperatura_min"
                        type="number"
                        step="0.1"
                        value={umbrales.temperatura_min || ''}
                        onChange={(e) => setUmbrales({...umbrales, temperatura_min: e.target.value ? parseFloat(e.target.value) : null})}
                        placeholder="Ej: 20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="temperatura_max">Temperatura Máxima (°C)</Label>
                      <Input
                        id="temperatura_max"
                        type="number"
                        step="0.1"
                        value={umbrales.temperatura_max || ''}
                        onChange={(e) => setUmbrales({...umbrales, temperatura_max: e.target.value ? parseFloat(e.target.value) : null})}
                        placeholder="Ej: 35"
                      />
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="humedad_min">Humedad Mínima (%)</Label>
                      <Input
                        id="humedad_min"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={umbrales.humedad_min || ''}
                        onChange={(e) => setUmbrales({...umbrales, humedad_min: e.target.value ? parseFloat(e.target.value) : null})}
                        placeholder="Ej: 40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="humedad_max">Humedad Máxima (%)</Label>
                      <Input
                        id="humedad_max"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={umbrales.humedad_max || ''}
                        onChange={(e) => setUmbrales({...umbrales, humedad_max: e.target.value ? parseFloat(e.target.value) : null})}
                        placeholder="Ej: 80"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

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
