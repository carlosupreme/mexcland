
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import TinaCard from './TinaCard';
import { Tina, LecturaConTina } from '@/types/dashboard';

interface TinasActivasSectionProps {
  tinas: Tina[];
  lecturas: LecturaConTina[];
  getLecturasPorTina: (tinaId: string) => LecturaConTina[];
  alertasPorTina: Record<string, number>;
}

const TinasActivasSection = ({ 
  tinas, 
  lecturas, 
  getLecturasPorTina, 
  alertasPorTina 
}: TinasActivasSectionProps) => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const handleNuevaTina = () => {
    navigate('/tinas');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Tinas Activas</CardTitle>
            <CardDescription>
              Supervisa el estado de tus tanques de fermentación en tiempo real
            </CardDescription>
          </div>
          {userRole === 'admin' && (
            <Button onClick={handleNuevaTina} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nueva Tina
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {tinas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏺</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay tinas registradas</h3>
            <p className="text-gray-600 mb-4">
              Comienza agregando tu primera tina de fermentación
            </p>
            {userRole === 'admin' && (
              <Button onClick={handleNuevaTina}>
                Agregar Primera Tina
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tinas.map((tina) => (
              <TinaCard
                key={tina.id}
                tina={tina}
                lecturas={getLecturasPorTina(tina.id)}
                alertasActivas={alertasPorTina[tina.id] || 0}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TinasActivasSection;
