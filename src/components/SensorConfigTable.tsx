
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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

interface SensorConfigTableProps {
  configuraciones: SensorConfig[];
  loading: boolean;
  onEdit: (config: SensorConfig) => void;
  onDelete: (configId: string) => void;
}

export const SensorConfigTable = ({ configuraciones, loading, onEdit, onDelete }: SensorConfigTableProps) => {
  console.log('SensorConfigTable - configuraciones recibidas:', configuraciones);
  console.log('SensorConfigTable - loading:', loading);
  console.log('SensorConfigTable - cantidad de configuraciones:', configuraciones?.length || 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSensorDisplay = (config: SensorConfig) => {
    if (config.sensor?.device_id) {
      return config.sensor.device_id;
    }
    if (config.sensor?.id) {
      return config.sensor.id.substring(0, 8) + '...';
    }
    if (config.sensor_id) {
      return config.sensor_id.substring(0, 8) + '...';
    }
    return 'Sin sensor';
  };

  const getEstadoBadgeVariant = (estado: string | null) => {
    switch (estado) {
      case 'Conectado':
        return 'default';
      case 'Desconectado':
        return 'secondary';
      case 'Disponible':
        return 'outline';
      case 'En uso':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-muted-foreground">Cargando configuraciones...</div>
      </div>
    );
  }

  if (!configuraciones || configuraciones.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron configuraciones registradas.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sensor</TableHead>
          <TableHead>Estado Sensor</TableHead>
          <TableHead>Device ID Config</TableHead>
          <TableHead>Frecuencia (min)</TableHead>
          <TableHead>Fecha Creación</TableHead>
          <TableHead>Última Actualización</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {configuraciones.map((config) => (
          <TableRow key={config.id}>
            <TableCell className="font-medium">
              {getSensorDisplay(config)}
            </TableCell>
            <TableCell>
              <Badge variant={getEstadoBadgeVariant(config.sensor?.estado)}>
                {config.sensor?.estado || 'Sin estado'}
              </Badge>
            </TableCell>
            <TableCell>
              {config.device_id || 'No configurado'}
            </TableCell>
            <TableCell>
              {config.frecuencia_actualizacion ? `${config.frecuencia_actualizacion} min` : 'No configurado'}
            </TableCell>
            <TableCell>{formatDate(config.created_at)}</TableCell>
            <TableCell>
              {config.updated_at ? formatDate(config.updated_at) : 'Nunca'}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(config)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(config.id)}
                >
                  Eliminar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
