
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

interface TinaTableProps {
  tinas: Tina[];
  loading: boolean;
  onEdit: (tina: Tina) => void;
  onDelete: (tinaId: string) => void;
}

export const TinaTable = ({ tinas, loading, onEdit, onDelete }: TinaTableProps) => {
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Disponible':
        return 'default';
      case 'En uso':
        return 'secondary';
      case 'Mantenimiento':
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
        <div className="text-muted-foreground">Cargando tinas...</div>
      </div>
    );
  }

  if (tinas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron tinas registradas.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Capacidad (L)</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Tipo de Agave</TableHead>
          <TableHead>Sensor ID</TableHead>
          <TableHead>Fecha Creación</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tinas.map((tina) => (
          <TableRow key={tina.id}>
            <TableCell className="font-medium">{tina.nombre}</TableCell>
            <TableCell>{tina.capacidad.toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={getEstadoBadgeVariant(tina.estado)}>
                {tina.estado}
              </Badge>
            </TableCell>
            <TableCell>{tina.tipo_agave || 'No asignado'}</TableCell>
            <TableCell>{tina.sensor_id ? tina.sensor_id.substring(0, 8) + '...' : 'Sin sensor'}</TableCell>
            <TableCell>{formatDate(tina.fecha_creacion)}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(tina)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(tina.id)}
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
