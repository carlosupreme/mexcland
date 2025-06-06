
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Thermometer } from 'lucide-react';

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bienvenido al sistema de gestión</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut size={16} />
            Cerrar Sesión
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Rol:</strong> {userRole || 'Cargando...'}</p>
                <p><strong>ID:</strong> {user?.id}</p>
              </div>
            </CardContent>
          </Card>

          {userRole === 'admin' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Gestión de Usuarios
                  </CardTitle>
                  <CardDescription>Administrar usuarios del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/users')}
                    className="w-full"
                  >
                    Ir a Usuarios
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Tinas</CardTitle>
                  <CardDescription>Administrar tinas de fermentación</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/tinas')}
                    className="w-full"
                  >
                    Ir a Tinas
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer size={20} />
                    Gestión de Sensores
                  </CardTitle>
                  <CardDescription>Administrar sensores del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/sensores')}
                    className="w-full"
                  >
                    Ir a Sensores
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Resumen del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Sistema activo</p>
                <p className="text-sm text-gray-600">Última conexión: Ahora</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
