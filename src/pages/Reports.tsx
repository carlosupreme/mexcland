
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DashboardNavigation from '@/components/DashboardNavigation';
import { ReportGenerator } from '@/components/ReportGenerator';
import { useDashboardData } from '@/hooks/useDashboardData';

const Reports = () => {
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { tinas, lecturas, loading: dataLoading } = useDashboardData();

  if (loading || dataLoading) {
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

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNavigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Generador de Reportes
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Selecciona las tinas y métricas que deseas incluir en tu reporte PDF
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ReportGenerator 
                tinas={tinas}
                lecturas={lecturas}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
