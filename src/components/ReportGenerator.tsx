import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tina, LecturaConTina } from '@/types/dashboard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { generatePDF } from '@/services/pdfGenerator';
import { cn } from '@/lib/utils';

interface ReportGeneratorProps {
  tinas: Tina[];
  lecturas: LecturaConTina[];
}

export const ReportGenerator = ({ tinas, lecturas }: ReportGeneratorProps) => {
  const { toast } = useToast();
  const [selectedTinas, setSelectedTinas] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const metrics = [
    { id: 'temperatura', label: 'Temperatura (°C)', icon: '🌡️' },
    { id: 'pH', label: 'pH', icon: '⚗️' },
    { id: 'humedad', label: 'Humedad (%)', icon: '💧' },
    { id: 'nivel_liquido', label: 'Nivel Líquido (%)', icon: '📊' }
  ];

  const handleTinaToggle = (tinaId: string) => {
    setSelectedTinas(prev => 
      prev.includes(tinaId) 
        ? prev.filter(id => id !== tinaId)
        : [...prev, tinaId]
    );
  };

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const selectAllTinas = () => {
    setSelectedTinas(tinas.map(tina => tina.id));
  };

  const clearAllTinas = () => {
    setSelectedTinas([]);
  };

  const selectAllMetrics = () => {
    setSelectedMetrics(metrics.map(metric => metric.id));
  };

  const clearAllMetrics = () => {
    setSelectedMetrics([]);
  };

  const getFilteredLecturas = (): LecturaConTina[] => {
    let filteredLecturas = lecturas;

    // Filtrar por rango de fechas si está definido
    if (dateRange.from && dateRange.to) {
      filteredLecturas = lecturas.filter(lectura => {
        const lecturaDate = new Date(lectura.created_at);
        const fromDate = new Date(dateRange.from!);
        const toDate = new Date(dateRange.to!);
        
        // Ajustar las fechas para incluir todo el día
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        
        return lecturaDate >= fromDate && lecturaDate <= toDate;
      });
    }

    return filteredLecturas;
  };

  const generateReport = async () => {
    if (selectedTinas.length === 0 || selectedMetrics.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos una tina y una métrica."
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const filteredLecturas = getFilteredLecturas();
      
      await generatePDF({
        selectedTinas,
        selectedMetrics,
        tinas,
        lecturas: filteredLecturas,
        dateRange
      });
      
      toast({
        title: "Reporte generado exitosamente",
        description: `Se descargó el reporte PDF con ${selectedTinas.length} tinas y ${selectedMetrics.length} métricas${dateRange.from && dateRange.to ? ' para el período seleccionado' : ''}.`
      });
    } catch (error) {
      console.error('Error generando reporte PDF:', error);
      toast({
        variant: "destructive",
        title: "Error al generar reporte",
        description: "No se pudo generar el archivo PDF. Inténtalo nuevamente."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getLecturasPorTina = (tinaId: string): LecturaConTina[] => {
    const tina = tinas.find(t => t.id === tinaId);
    if (!tina || !tina.sensor_id) return [];
    
    const filteredLecturas = getFilteredLecturas();
    return filteredLecturas.filter(lectura => lectura.sensor_id === tina.sensor_id);
  };

  const getTotalFilteredLecturas = () => {
    return getFilteredLecturas().length;
  };

  return (
    <div className="space-y-6">
      {/* Información del reporte */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Información del Reporte</span>
        </div>
        <p className="text-sm text-blue-700">
          Fecha de generación: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
        <p className="text-sm text-blue-700">
          Datos {dateRange.from && dateRange.to ? 'filtrados' : 'totales'}: {getTotalFilteredLecturas()} lecturas
        </p>
        {dateRange.from && dateRange.to && (
          <p className="text-sm text-blue-700">
            Período: {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
          </p>
        )}
      </div>

      {/* Selector de rango de fechas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1 bg-orange-100 rounded">
              <CalendarIcon className="h-4 w-4 text-orange-600" />
            </div>
            Filtrar por Fecha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Fecha de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    disabled={(date) => dateRange.from ? date < dateRange.from : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {(dateRange.from || dateRange.to) && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Selección de Tinas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                Seleccionar Tinas ({selectedTinas.length}/{tinas.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllTinas}>
                  Todas
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllTinas}>
                  Ninguna
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {tinas.map((tina) => {
              const lecturasTina = getLecturasPorTina(tina.id);
              return (
                <div key={tina.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                  <Checkbox
                    id={`tina-${tina.id}`}
                    checked={selectedTinas.includes(tina.id)}
                    onCheckedChange={() => handleTinaToggle(tina.id)}
                  />
                  <Label 
                    htmlFor={`tina-${tina.id}`} 
                    className="flex-1 cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-medium">{tina.nombre}</span>
                    <span className="text-xs text-gray-500">
                      {lecturasTina.length} lecturas
                    </span>
                  </Label>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Selección de Métricas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1 bg-purple-100 rounded">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                Seleccionar Métricas ({selectedMetrics.length}/{metrics.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllMetrics}>
                  Todas
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllMetrics}>
                  Ninguna
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                <Checkbox
                  id={`metric-${metric.id}`}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={() => handleMetricToggle(metric.id)}
                />
                <Label 
                  htmlFor={`metric-${metric.id}`} 
                  className="flex-1 cursor-pointer flex items-center gap-2"
                >
                  <span className="text-lg">{metric.icon}</span>
                  <span className="font-medium">{metric.label}</span>
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Resumen y Generación */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Resumen del Reporte</h3>
              <p className="text-gray-600">
                {selectedTinas.length > 0 && selectedMetrics.length > 0 ? (
                  <>
                    Se generará un reporte PDF con <strong>{selectedTinas.length} tinas</strong> y{' '}
                    <strong>{selectedMetrics.length} métricas</strong>
                    {dateRange.from && dateRange.to && (
                      <>
                        {' '}del período <strong>{format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}</strong>
                      </>
                    )}
                  </>
                ) : (
                  "Selecciona tinas y métricas para generar el reporte"
                )}
              </p>
            </div>
            
            <Button 
              onClick={generateReport}
              disabled={selectedTinas.length === 0 || selectedMetrics.length === 0 || isGenerating}
              className="flex items-center gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Descargar Reporte PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
