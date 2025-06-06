
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Tina, LecturaConTina } from '@/types/dashboard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface PDFOptions {
  selectedTinas: string[];
  selectedMetrics: string[];
  tinas: Tina[];
  lecturas: LecturaConTina[];
}

export const generatePDF = async (options: PDFOptions): Promise<void> => {
  const { selectedTinas, selectedMetrics, tinas, lecturas } = options;
  
  // Crear nuevo documento PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;
  
  // Título del reporte
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Reporte de Tinas', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Fecha del reporte
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const fechaReporte = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
  pdf.text(`Fecha: ${fechaReporte}`, 20, yPosition);
  
  yPosition += 20;
  
  // Información general
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resumen del Reporte', 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`• Tinas incluidas: ${selectedTinas.length}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`• Métricas analizadas: ${selectedMetrics.length}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`• Total de lecturas: ${lecturas.length}`, 25, yPosition);
  
  yPosition += 20;
  
  // Información por tina
  for (const tinaId of selectedTinas) {
    const tina = tinas.find(t => t.id === tinaId);
    if (!tina) continue;
    
    const lecturasTina = lecturas.filter(l => 
      tina.sensor_id && l.sensor_id === tina.sensor_id
    );
    
    // Verificar si necesitamos nueva página
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Nombre de la tina
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Tina: ${tina.nombre}`, 20, yPosition);
    yPosition += 10;
    
    // Datos por métrica
    for (const metrica of selectedMetrics) {
      const datosMetrica = lecturasTina
        .filter(l => l[metrica as keyof LecturaConTina] !== null)
        .slice(-10); // Últimas 10 lecturas
      
      if (datosMetrica.length === 0) continue;
      
      // Verificar espacio en página
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Título de la métrica
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const nombreMetrica = getMetricaLabel(metrica);
      pdf.text(`${nombreMetrica}:`, 25, yPosition);
      yPosition += 8;
      
      // Estadísticas
      const valores = datosMetrica.map(l => l[metrica as keyof LecturaConTina] as number);
      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
      const maximo = Math.max(...valores);
      const minimo = Math.min(...valores);
      const unidad = getUnidad(metrica);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`  Promedio: ${promedio.toFixed(2)}${unidad}`, 30, yPosition);
      yPosition += 4;
      pdf.text(`  Máximo: ${maximo.toFixed(2)}${unidad}`, 30, yPosition);
      yPosition += 4;
      pdf.text(`  Mínimo: ${minimo.toFixed(2)}${unidad}`, 30, yPosition);
      yPosition += 4;
      pdf.text(`  Lecturas: ${datosMetrica.length}`, 30, yPosition);
      yPosition += 8;
    }
    
    yPosition += 5;
  }
  
  // Pie de página en todas las páginas
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Sistema de Tinas - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  // Generar nombre del archivo
  const nombreArchivo = `reporte-tinas-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
  
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
      return 'Nivel Líquido';
    default:
      return metrica;
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
