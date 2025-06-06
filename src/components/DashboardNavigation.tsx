
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Settings, Thermometer, BarChart, LogOut, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DashboardNavigation = () => {
  const { userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigationItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: BarChart,
      description: "Gráficas y estadísticas"
    },
    {
      title: "Reportes",
      path: "/reports",
      icon: FileText,
      description: "Generar reportes PDF"
    },
    ...(userRole === 'admin' ? [
      {
        title: "Usuarios",
        path: "/users",
        icon: Users,
        description: "Gestión de usuarios"
      },
      {
        title: "Tinas",
        path: "/tinas",
        icon: Settings,
        description: "Gestión de tinas"
      },
      {
        title: "Sensores",
        path: "/sensores",
        icon: Thermometer,
        description: "Gestión de sensores"
      }
    ] : [])
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Sistema de Tinas</h2>
        <p className="text-sm text-gray-600">Control y monitoreo</p>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start gap-3 h-auto p-3"
              onClick={() => navigate(item.path)}
            >
              <Icon size={20} />
              <div className="text-left">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs opacity-70">{item.description}</div>
              </div>
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          onClick={handleSignOut} 
          className="w-full flex items-center gap-2"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default DashboardNavigation;
