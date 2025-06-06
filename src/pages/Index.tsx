
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Thermometer, Droplets, BarChart3, Shield, Zap, Leaf, Users, AlertTriangle } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-6xl font-bold mb-6 text-amber-900 tracking-tight">
            MEXCLAND
          </h1>
          <p className="text-2xl text-amber-800 mb-4 font-medium">
            Sistema Inteligente de Control y Monitoreo
          </p>
          <p className="text-xl text-amber-700 mb-8">
            para la Producción Artesanal de Mezcal
          </p>
          <p className="text-lg text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Moderniza tu proceso tradicional de fermentación con tecnología IoT avanzada. 
            Controla temperatura, pH y flujo de agua de manera automatizada, garantizando 
            la máxima calidad y consistencia en cada lote.
          </p>
          
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => window.location.href = '/auth'}
          >
            Acceder a la Plataforma
          </Button>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-amber-900 mb-12">
            Beneficios de la Automatización
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-900">Mayor Calidad</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  Control preciso de parámetros críticos reduce la variabilidad y 
                  permite detección temprana de anomalías en cada lote.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-900">Eficiencia Operativa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  Automatización de tareas rutinarias elimina verificaciones manuales 
                  frecuentes, reduciendo costos operativos significativamente.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Droplets className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-900">Uso Óptimo del Agua</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  Válvulas automáticas regulan con precisión la entrada de agua, 
                  evitando desperdicios en regiones con recursos hídricos limitados.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-amber-900 mb-12">
            Funcionalidades Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-amber-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Thermometer className="h-6 w-6 text-amber-600" />
                  <CardTitle className="text-lg text-amber-900">Monitoreo en Tiempo Real</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Supervisa temperatura y pH mediante sensores IoT con datos actualizados 
                  constantemente para control total del proceso de fermentación.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                  <CardTitle className="text-lg text-amber-900">Reportes y Análisis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Genera informes personalizables y visualizaciones gráficas basadas en 
                  datos históricos para identificar patrones óptimos de producción.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-amber-600" />
                  <CardTitle className="text-lg text-amber-900">Gestión de Usuarios</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Sistema de roles diferenciados con permisos específicos y registro 
                  completo de actividades para auditoría y trazabilidad.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  <CardTitle className="text-lg text-amber-900">Sistema de Alertas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Umbrales personalizables con lógica condicional para detección temprana 
                  de anomalías y notificaciones priorizadas según criticidad.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Environmental Impact Section */}
        <div className="mb-16">
          <Card className="border-green-200 bg-green-50 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">Compromiso Ambiental</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-green-700 text-lg">
                Diseñado especialmente para regiones con recursos hídricos limitados. 
                Nuestro sistema minimiza el impacto ambiental optimizando el uso del agua 
                y reduciendo la huella ecológica de la producción artesanal de mezcal.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Innovation Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-xl border border-amber-200">
          <h2 className="text-3xl font-bold text-amber-900 mb-6">
            Tradición y Tecnología en Armonía
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            MEXCLAND respeta los métodos artesanales tradicionales mientras incorpora 
            tecnología moderna para garantizar la excelencia. Creamos un registro histórico 
            completo que documenta automáticamente todas las variables, permitiendo descubrir 
            condiciones ideales específicas para cada variedad de agave.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">100%</div>
              <div className="text-gray-600">Trazabilidad del Proceso</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">24/7</div>
              <div className="text-gray-600">Monitoreo Continuo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">IoT</div>
              <div className="text-gray-600">Tecnología Avanzada</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
