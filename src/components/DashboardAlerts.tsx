
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AlertsList } from './AlertsList';
import { useAuth } from '@/hooks/useAuth';

export const DashboardAlerts = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const handleViewAllAlerts = () => {
    if (userRole === 'admin') {
      navigate('/alertas');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <CardTitle className="text-lg">Alertas Recientes</CardTitle>
              <CardDescription>
                Últimas alertas del sistema de monitoreo
              </CardDescription>
            </div>
          </div>
          {userRole === 'admin' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewAllAlerts}
              className="flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              Ver todas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AlertsList limit={5} showActions={false} />
      </CardContent>
    </Card>
  );
};
