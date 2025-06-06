
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserForm } from '@/components/UserForm';
import { UserTable } from '@/components/UserTable';
import { User, UserPlus } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  created_at: string;
  role?: string;
}

const UserManagement = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchUsers();
    }
  }, [user, userRole]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      
      // Fetch users from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Combine profile data with roles
      const usersWithRoles = profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id);
        
        return {
          id: profile.id,
          email: profile.username || 'Sin email', // Using username as email placeholder
          full_name: profile.full_name || '',
          username: profile.username || '',
          created_at: profile.created_at,
          role: userRole?.role || 'Sin rol'
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los usuarios."
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      // Delete user role first
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Delete profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      await fetchUsers();
      
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente."
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario."
      });
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingUser(null);
    await fetchUsers();
  };

  // Show loading screen while authentication is loading
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

  // Only redirect if we're sure the user is not an admin
  // This prevents redirecting while userRole is still loading
  if (!user || (userRole !== null && userRole !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while userRole is still null (loading)
  if (userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-amber-800">MEXCLAND</h1>
              <Badge className="bg-red-100 text-red-800 border-red-200">
                Administrador
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                size="sm"
              >
                Volver al Dashboard
              </Button>
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
                <User className="h-8 w-8" />
                <span>Gestión de Usuarios</span>
              </h2>
              <p className="text-gray-600">
                Administrar usuarios del sistema y sus roles
              </p>
            </div>
            <Button
              onClick={handleCreateUser}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              Total de usuarios registrados: {users.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4">Cargando usuarios...</p>
              </div>
            ) : (
              <UserTable
                users={users}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            )}
          </CardContent>
        </Card>

        {/* User Form Modal */}
        {showForm && (
          <UserForm
            user={editingUser}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default UserManagement;
