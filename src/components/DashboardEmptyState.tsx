
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DashboardEmptyState = () => {
  const { userRole } = useAuth();

  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="text-gray-500">
          <BarChart size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No hay tinas con sensores configurados</h3>
          <p className="mb-4">Para ver las gráficas, necesitas tener tinas con sensores asignados.</p>
          {userRole === 'admin' && (
            <Button onClick={() => window.location.href = '/tinas'}>
              Configurar Tinas
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardEmptyState;
