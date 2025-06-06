
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { UserForm } from '@/components/UserForm';
import { UserTable } from '@/components/UserTable';
import { Plus } from 'lucide-react';
import DashboardNavigation from '@/components/DashboardNavigation';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  created_at: string;
  role?: string;
}

const UserManagement = () => {
  const { userRole, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole, loading, navigate]);

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
          email: profile.username || 'Sin email',
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

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <DashboardNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNavigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Administra los usuarios del sistema y sus roles
                  </CardDescription>
                </div>
                <Button onClick={handleCreateUser} className="flex items-center gap-2">
                  <Plus size={16} />
                  Nuevo Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            </CardContent>
          </Card>

          {showForm && (
            <UserForm
              user={editingUser}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
