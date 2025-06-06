
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-6xl font-bold mb-6 text-amber-800">MEXCLAND</h1>
        <p className="text-2xl text-amber-700 mb-8">
          Plataforma Digital para Productores de Mezcal
        </p>
        <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
          Controla y monitorea tu producción de mezcal con nuestra plataforma integral. 
          Gestiona tinas, sensores, lotes y genera reportes detallados de tu proceso productivo.
        </p>
        
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/auth'}
          >
            Acceder a MEXCLAND
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Monitoreo en Tiempo Real</h3>
            <p className="text-gray-600">
              Supervisa temperatura, pH y nivel de líquido de tus tinas de fermentación
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Reportes Detallados</h3>
            <p className="text-gray-600">
              Genera reportes completos de producción y análisis de calidad
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Control Automatizado</h3>
            <p className="text-gray-600">
              Controla válvulas y sistemas automatizados desde la plataforma
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
