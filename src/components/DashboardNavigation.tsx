import { BarChart3, Settings, Activity, Cog, Users, FileText, AlertTriangle } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MenuItem {
  path: string;
  label: string;
  icon: any;
}

const DashboardNavigation = () => {
  const { userRole } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const adminMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/tinas', label: 'Gestión de Tinas', icon: Settings },
    { path: '/sensores', label: 'Gestión de Sensores', icon: Activity },
    { path: '/configuraciones', label: 'Configuraciones', icon: Cog },
    { path: '/alertas', label: 'Alertas', icon: AlertTriangle },
    { path: '/usuarios', label: 'Gestión de Usuarios', icon: Users },
    { path: '/reportes', label: 'Reportes', icon: FileText },
  ];

  const employeeMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/reportes', label: 'Reportes', icon: FileText },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <div className="w-64 flex-shrink-0 border-r bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <ul className="space-y-2 font-medium">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 group dark:text-gray-300 dark:hover:bg-gray-700",
                    isActive && "bg-gray-100 dark:bg-gray-700"
                  )
                }
              >
                <item.icon className="w-5 h-5 text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
                <span className="ms-3">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardNavigation;
