
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  created_at: string;
  role?: string;
}

interface UserFormProps {
  user: UserProfile | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export const UserForm = ({ user, onSubmit, onCancel }: UserFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    username: '',
    password: '',
    role: 'empleado' as 'admin' | 'empleado'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        username: user.username,
        password: '',
        role: (user.role as 'admin' | 'empleado') || 'empleado'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Update existing user
        await updateUser();
      } else {
        // Create new user
        await createUser();
      }
      
      toast({
        title: user ? "Usuario actualizado" : "Usuario creado",
        description: user ? "El usuario ha sido actualizado exitosamente." : "El usuario ha sido creado exitosamente."
      });
      
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: user ? "No se pudo actualizar el usuario." : "No se pudo crear el usuario."
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          username: formData.username
        }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      // Update profile if it exists (the trigger should create it)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: formData.full_name,
          username: formData.username
        });

      if (profileError) throw profileError;

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: authData.user.id,
          role: formData.role
        });

      if (roleError) throw roleError;
    }
  };

  const updateUser = async () => {
    if (!user) return;

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        username: formData.username
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    // Update role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role: formData.role
      });

    if (roleError) throw roleError;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</CardTitle>
          <CardDescription>
            {user ? 'Modifica los datos del usuario' : 'Crear un nuevo usuario en el sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                disabled={!!user}
              />
            </div>

            <div>
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>

            {!user && (
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
            )}

            <div>
              <Label>Rol</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => setFormData({...formData, role: value as 'admin' | 'empleado'})}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="empleado" id="empleado" />
                  <Label htmlFor="empleado">Empleado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Administrador</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Guardando...' : (user ? 'Actualizar' : 'Crear')}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
