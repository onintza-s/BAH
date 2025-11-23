import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Detection, Metrics } from '../types/detection';

export function exportDetectionsPdf(
  detections: Detection[],
  metrics?: Metrics | null
) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('Edge-Ready Object Detection Report', 14, 16);

  let y = 24;

  if (metrics) {
    doc.setFontSize(10);
    doc.text(`Images: ${metrics.num_images}`, 14, y); y += 5;
    doc.text(`Detections: ${metrics.num_detections}`, 14, y); y += 5;
    doc.text(`Total time: ${metrics.total_seconds.toFixed(2)} s`, 14, y); y += 5;
    if (metrics.avg_seconds_per_image !== null) {
      doc.text(`Avg / image: ${metrics.avg_seconds_per_image.toFixed(2)} s`, 14, y);
      y += 5;
    }
  }

  y += 6;

  if (detections.length === 0) {
    doc.setFontSize(10);
    doc.text('No detections for current filters.', 14, y);
    doc.save('detection-report.pdf');
    return;
  }

  const columns = [
    { header: 'Type', dataKey: 'class' },
    { header: 'Conf', dataKey: 'conf' },
    { header: 'File', dataKey: 'file' },
    { header: 'Lon [min, max]', dataKey: 'lon' },
    { header: 'Lat [min, max]', dataKey: 'lat' },
  ];

  const rows = detections.map((d) => ({
    class: d.class,
    conf: (d.confidence * 100).toFixed(1) + '%',
    file: d.file,
    lon: `${d.bbox.min_lon.toFixed(5)}  –  ${d.bbox.max_lon.toFixed(5)}`,
    lat: `${d.bbox.min_lat.toFixed(5)}  –  ${d.bbox.max_lat.toFixed(5)}`,
  }));

  autoTable(doc, {
    startY: y,
    columns,
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [20, 20, 30],
    },
    columnStyles: {
      class: { cellWidth: 28 },
      conf: { cellWidth: 28 },
      file: { cellWidth: 60 },
      lon: { cellWidth: 28 },
      lat: { cellWidth: 28 },
    },
  });

  doc.save('detection-report.pdf');
}
