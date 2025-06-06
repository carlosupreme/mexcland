
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { user, signOut, userRole, loading } = useAuth();

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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'empleado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-amber-800">MEXCLAND</h1>
              <Badge className={getRoleBadgeColor(userRole)}>
                {userRole === 'admin' ? 'Administrador' : userRole === 'empleado' ? 'Empleado' : 'Sin rol'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.user_metadata?.full_name || user.email}
              </span>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido a MEXCLAND!
          </h2>
          <p className="text-gray-600">
            Plataforma integral para productores de mezcal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Producción Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📊</span>
                <span>Producción</span>
              </CardTitle>
              <CardDescription>
                Monitoreo de tinas y procesos de fermentación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Gestiona y monitorea tus procesos de producción en tiempo real.
              </p>
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                Ver Producción
              </Button>
            </CardContent>
          </Card>

          {/* Inventario Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📦</span>
                <span>Inventario</span>
              </CardTitle>
              <CardDescription>
                Control de materias primas y productos terminados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Lleva un control detallado de tu inventario y materiales.
              </p>
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                Ver Inventario
              </Button>
            </CardContent>
          </Card>

          {/* Reportes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📈</span>
                <span>Reportes</span>
              </CardTitle>
              <CardDescription>
                Análisis y reportes de producción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Genera reportes detallados de tu producción y ventas.
              </p>
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                Ver Reportes
              </Button>
            </CardContent>
          </Card>

          {/* Admin Only Cards */}
          {isAdmin && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>👥</span>
                    <span>Gestión de Usuarios</span>
                  </CardTitle>
                  <CardDescription>
                    Administrar usuarios y permisos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Gestiona los usuarios del sistema y sus roles.
                  </p>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Administrar Usuarios
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>⚙️</span>
                    <span>Configuración</span>
                  </CardTitle>
                  <CardDescription>
                    Configuración del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Configura parámetros del sistema y sensores.
                  </p>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Configurar Sistema
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">12</p>
                <p className="text-sm text-gray-600">Tinas Activas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">8</p>
                <p className="text-sm text-gray-600">Lotes en Proceso</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">24</p>
                <p className="text-sm text-gray-600">Sensores Conectados</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">156</p>
                <p className="text-sm text-gray-600">Litros Producidos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
