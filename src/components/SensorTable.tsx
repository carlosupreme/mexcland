
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
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface SensorTableProps {
  sensores: Sensor[];
  loading: boolean;
  onEdit: (sensor: Sensor) => void;
  onDelete: (sensorId: string) => void;
}

export const SensorTable = ({ sensores, loading, onEdit, onDelete }: SensorTableProps) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-muted-foreground">Cargando sensores...</div>
      </div>
    );
  }

  if (sensores.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron sensores registrados.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Device ID</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha Creación</TableHead>
          <TableHead>Última Actualización</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sensores.map((sensor) => (
          <TableRow key={sensor.id}>
            <TableCell className="font-medium">
              {sensor.device_id || sensor.id.substring(0, 8) + '...'}
            </TableCell>
            <TableCell>
              <Badge variant={getEstadoBadgeVariant(sensor.estado)}>
                {sensor.estado || 'Sin estado'}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(sensor.created_at)}</TableCell>
            <TableCell>{formatDate(sensor.updated_at)}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(sensor)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(sensor.id)}
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
