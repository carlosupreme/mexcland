import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Tina, LecturaConTina } from '@/types/dashboard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface PDFOptions {
  selectedTinas: string[];
  selectedMetrics: string[];
  tinas: Tina[];
  lecturas: LecturaConTina[];
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export const generatePDF = async (options: PDFOptions): Promise<void> => {
  const { selectedTinas, selectedMetrics, tinas, lecturas, dateRange } = options;
  
  // Crear nuevo documento PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  
  // Colores corporativos
  const colors = {
    primary: [41, 98, 255] as [number, number, number],
    secondary: [74, 144, 226] as [number, number, number],
    accent: [16, 185, 129] as [number, number, number],
    dark: [31, 41, 55] as [number, number, number],
    medium: [107, 114, 128] as [number, number, number],
    light: [243, 244, 246] as [number, number, number],
    white: [255, 255, 255] as [number, number, number]
  };
  
  // Función para agregar header de página
  const addPageHeader = (pageNum: number, totalPages: number) => {
    // Línea superior azul
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(0, 0, pageWidth, 8, 'F');
    
    // Logo/Título principal
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.text('MEXCLAND', margin, 25);
    
    // Subtítulo
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.medium[0], colors.medium[1], colors.medium[2]);
    pdf.text('Reporte de Análisis de Datos', margin, 35);
    
    // Línea divisoria
    pdf.setDrawColor(colors.light[0], colors.light[1], colors.light[2]);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 40, pageWidth - margin, 40);
    
    // Número de página
    if (totalPages > 1) {
      pdf.setFontSize(9);
      pdf.setTextColor(colors.medium[0], colors.medium[1], colors.medium[2]);
      pdf.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin - 20, 15);
    }
    
    return 50; // Nueva posición Y después del header
  };
  
  // Función para verificar espacio en página
  const checkPageSpace = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      pdf.addPage();
      yPosition = addPageHeader(pdf.getNumberOfPages(), 0); // Se actualizará al final
      return true;
    }
    return false;
  };
  
  // Función para agregar sección con estilo
  const addSection = (title: string, icon?: string) => {
    checkPageSpace(20);
    
    // Fondo de la sección
    pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    pdf.rect(margin, yPosition - 2, contentWidth, 12, 'F');
    
    // Título de sección
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    const titleText = icon ? `${icon} ${title}` : title;
    pdf.text(titleText, margin + 5, yPosition + 6);
    
    yPosition += 15;
  };
  
  // Función para agregar información en formato tabla
  const addInfoRow = (label: string, value: string, indent: number = 0) => {
    checkPageSpace(8);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.medium[0], colors.medium[1], colors.medium[2]);
    pdf.text(`${label}:`, margin + indent, yPosition);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    pdf.text(value, margin + indent + 50, yPosition);
    
    yPosition += 6;
  };
  
  // Header de primera página
  yPosition = addPageHeader(1, 0);
  
  // Información del reporte
  addSection('Información del Reporte', '');
  
  const fechaReporte = format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  addInfoRow('Fecha de generación', fechaReporte);
  addInfoRow('Tinas analizadas', selectedTinas.length.toString());
  addInfoRow('Métricas incluidas', selectedMetrics.length.toString());
  addInfoRow('Total de lecturas', lecturas.length.toString());
  
  if (dateRange?.from && dateRange?.to) {
    addInfoRow('Período analizado', 
      `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
    );
  }
  
  yPosition += 10;
  
  // Resumen de métricas seleccionadas
  if (selectedMetrics.length > 0) {
    addSection('Métricas Analizadas', '');
    
    selectedMetrics.forEach(metrica => {
      const label = getMetricaLabel(metrica);
      const unidad = getUnidad(metrica);
      addInfoRow('', `• ${label}${unidad ? ` (${unidad})` : ''}`, 5);
    });
    
    yPosition += 10;
  }
  
  // Análisis por tina
  addSection('Análisis Detallado por Tina', '');
  
  for (const tinaId of selectedTinas) {
    const tina = tinas.find(t => t.id === tinaId);
    if (!tina) continue;
    
    const lecturasTina = lecturas.filter(l => 
      tina.sensor_id && l.sensor_id === tina.sensor_id
    );
    
    checkPageSpace(30);
    
    // Header de tina con estilo
    pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    pdf.rect(margin, yPosition, contentWidth, 10, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    pdf.text(`${tina.nombre}`, margin + 5, yPosition + 7);
    
    yPosition += 15;
    
    // Información básica de la tina
    if (tina.capacidad) {
      addInfoRow('Capacidad', `${tina.capacidad.toLocaleString()} L`, 5);
    }
    if (tina.tipo_agave) {
      addInfoRow('Tipo de agave', tina.tipo_agave, 5);
    }
    if (tina.estado) {
      addInfoRow('Estado', tina.estado, 5);
    }
    
    addInfoRow('Lecturas en período', lecturasTina.length.toString(), 5);
    
    if (lecturasTina.length > 0) {
      const primeraLectura = lecturasTina[lecturasTina.length - 1];
      const ultimaLectura = lecturasTina[0];
      addInfoRow('Primera lectura', 
        format(new Date(primeraLectura.created_at), 'dd/MM/yyyy HH:mm'), 5);
      addInfoRow('Última lectura', 
        format(new Date(ultimaLectura.created_at), 'dd/MM/yyyy HH:mm'), 5);
    }
    
    yPosition += 5;
    
    // Análisis por métrica
    for (const metrica of selectedMetrics) {
      const datosMetrica = lecturasTina
        .filter(l => l[metrica as keyof LecturaConTina] !== null)
        .slice(-50); // Últimas 50 lecturas del período
      
      checkPageSpace(25);
      
      // Título de métrica con icono
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      const nombreMetrica = getMetricaLabel(metrica);
      const iconoMetrica = getMetricaIcon(metrica);
      pdf.text(`${iconoMetrica} ${nombreMetrica}`, margin + 10, yPosition);
      yPosition += 8;
      
      if (datosMetrica.length === 0) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(colors.medium[0], colors.medium[1], colors.medium[2]);
        pdf.text('Sin datos disponibles en el período seleccionado', margin + 15, yPosition);
        yPosition += 8;
        continue;
      }
      
      // Estadísticas en formato tabla
      const valores = datosMetrica.map(l => l[metrica as keyof LecturaConTina] as number);
      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
      const maximo = Math.max(...valores);
      const minimo = Math.min(...valores);
      const unidad = getUnidad(metrica);
      
      // Crear mini tabla de estadísticas
      const stats = [
        ['Promedio:', `${promedio.toFixed(2)}${unidad}`],
        ['Máximo:', `${maximo.toFixed(2)}${unidad}`],
        ['Mínimo:', `${minimo.toFixed(2)}${unidad}`],
        ['Muestras:', datosMetrica.length.toString()]
      ];
      
      stats.forEach(([label, value]) => {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.medium[0], colors.medium[1], colors.medium[2]);
        pdf.text(label, margin + 15, yPosition);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.text(value, margin + 50, yPosition);
        yPosition += 5;
      });
      
      yPosition += 8;
    }
    
    yPosition += 10;
  }
  
  // Footer en todas las páginas
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Actualizar número de página en header
    if (totalPages > 1) {
      pdf.setFontSize(9);
      pdf.setTextColor(colors.medium[0], colors.medium[1], colors.medium[2]);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, 15);
    }
    
    // Footer
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    pdf.text(
      'Sistema de Monitoreo de Tinas - Reporte Automatizado',
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
    
    pdf.setFontSize(7);
    pdf.text(
      `Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' }
    );
  }
  
  // Generar nombre del archivo más descriptivo
  let nombreArchivo = `reporte-tinas-${format(new Date(), 'yyyy-MM-dd-HHmm')}`;
  if (selectedTinas.length === 1) {
    const tina = tinas.find(t => t.id === selectedTinas[0]);
    if (tina) {
      nombreArchivo += `-${tina.nombre.replace(/\s+/g, '-').toLowerCase()}`;
    }
  }
  if (dateRange?.from && dateRange?.to) {
    nombreArchivo += `-${format(dateRange.from, 'ddMMyyyy')}-${format(dateRange.to, 'ddMMyyyy')}`;
  }
  nombreArchivo += '.pdf';
  
  // Descargar el PDF
  pdf.save(nombreArchivo);
};

const getMetricaLabel = (metrica: string): string => {
  switch (metrica) {
    case 'temperatura':
      return 'Temperatura';
    case 'pH':
      return 'pH';
    case 'humedad':
      return 'Humedad';
    case 'nivel_liquido':
      return 'Nivel de Líquido';
    default:
      return metrica;
  }
};

const getMetricaIcon = (metrica: string): string => {
  switch (metrica) {
    case 'temperatura':
      return '';
    case 'pH':
      return '';
    case 'humedad':
      return '';
    case 'nivel_liquido':
      return '';
    default:
      return '';
  }
};

const getUnidad = (metrica: string): string => {
  switch (metrica) {
    case 'temperatura':
      return '°C';
    case 'pH':
      return '';
    case 'humedad':
      return '%';
    case 'nivel_liquido':
      return '%';
    default:
      return '';
  }
};
