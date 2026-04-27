import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  ImageRun, 
  AlignmentType, 
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType
} from 'docx';

/**
 * Capture a list of elements as base64 images using html-to-image
 * This supports modern CSS (oklch) natively.
 */
export const captureCharts = async (elementIds) => {
  const images = {};
  for (const id of elementIds) {
    const element = document.getElementById(id);
    if (element) {
      try {
        const dataUrl = await htmlToImage.toPng(element, {
          backgroundColor: '#ffffff',
          pixelRatio: 2,
        });
        images[id] = dataUrl;
      } catch (err) {
        console.error(`Failed to capture chart ${id}:`, err);
      }
    }
  }
  return images;
};

/**
 * Generate CSV Report
 */
export const exportToCSV = (data, filters) => {
  const rows = [
    ['Summary', '', 'Date Range', filters.dateRangeLabel || 'All'],
    ['Summary', '', 'Total Residents', data.totals.residents],
    ['Summary', '', 'Total Households', data.totals.households],
    ['Summary', '', 'Total Brgy IDs', data.totals.eids],
    ['', '', '', '', ''],
    ['Section', 'Category', 'Label', 'Value', 'Extra'],
    
    // Demographics - Age Group
    ...(data.ageGroups || []).map(ag => ['Demographics', 'Age Group', ag.bracket, ag.count, '']),
    
    // Demographics - Gender
    ['Demographics', 'Gender', 'Male', (data.gender?.male || 0) + '%', ''],
    ['Demographics', 'Gender', 'Female', (data.gender?.female || 0) + '%', ''],
    
    // Household - Sitio
    ['', '', '', '', ''],
    ['Household', 'Sitio', 'Label', 'Value', ''],
    ...(data.householdsPerPurok || []).map(p => ['Household', 'Sitio', p.name, p.count, '']),
    
    // Growth
    ['', '', '', '', ''],
    ...(data.populationGrowth || []).map(g => ['Growth', 'Year', g.year, g.count, '']),
  ];

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `BarangayLink_Analytics_${filters.year}.csv`);
};

/**
 * Generate XLSX Report with Charts
 */
export const exportToXLSX = async (data, filters, chartImages = {}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('BarangayLink_Analytics');

  worksheet.columns = [
    { width: 20 }, { width: 20 }, { width: 25 }, { width: 15 }, { width: 15 }
  ];

  const titleRow = worksheet.addRow(['BarangayLink Analytics Report']);
  titleRow.font = { size: 16, bold: true };
  worksheet.mergeCells('A1:E1');

  worksheet.addRow(['Generated on:', new Date().toLocaleString()]);
  worksheet.addRow(['Year:', filters.year]);
  worksheet.addRow([]);

  worksheet.addRow(['Summary Statistics']).font = { bold: true };
  worksheet.addRow(['Total Residents', data.totals?.residents || 0]);
  worksheet.addRow(['Total Households', data.totals?.households || 0]);
  worksheet.addRow(['Total Brgy IDs', data.totals?.eids || 0]);
  worksheet.addRow([]);

  for (const [id, base64] of Object.entries(chartImages)) {
    const imageId = workbook.addImage({
      base64: base64.split(',')[1],
      extension: 'png',
    });

    worksheet.addRow([id.replace(/-/g, ' ').toUpperCase()]).font = { bold: true };
    worksheet.addImage(imageId, {
      tl: { col: 0, row: worksheet.rowCount },
      ext: { width: 600, height: 320 }
    });
    for(let i=0; i<18; i++) worksheet.addRow([]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `BarangayLink_Analytics_${filters.year}.xlsx`);
};

/**
 * Generate PDF Report (Full Snapshot)
 */
export const exportToPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const dataUrl = await htmlToImage.toPng(element, {
      backgroundColor: '#F3F7F3',
      pixelRatio: 2,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('PDF generation failed:', err);
    throw err;
  }
};

/**
 * Generate DOCX Report
 */
export const exportToDOCX = async (data, filters, chartImages = {}) => {
  const sections = [];
  sections.push({
    children: [
      new Paragraph({
        text: "BarangayLink HMS - Analytics Report",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Report Year: ${filters.year}`, bold: true }),
          new TextRun({ text: ` | Generated on: ${new Date().toLocaleDateString()}`, break: 1 }),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "", spacing: { after: 400 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Statistic")], shading: { fill: "E8F5E9" } }),
              new TableCell({ children: [new Paragraph("Value")], shading: { fill: "E8F5E9" } }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Total Residents")] }),
              new TableCell({ children: [new Paragraph(data.totals.residents.toString())] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Total Households")] }),
              new TableCell({ children: [new Paragraph(data.totals.households.toString())] }),
            ],
          }),
        ],
      }),
      new Paragraph({ text: "", break: 1 }),
    ],
  });

  for (const [id, base64] of Object.entries(chartImages)) {
    const buffer = Uint8Array.from(atob(base64.split(',')[1]), c => c.charCodeAt(0));
    sections[0].children.push(
      new Paragraph({
        text: id.replace(/-/g, ' ').toUpperCase(),
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [
          new ImageRun({
            data: buffer,
            transformation: { width: 550, height: 300 },
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "", break: 1 })
    );
  }

  const doc = new Document({ sections });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `BarangayLink_Analytics_${filters.year}.docx`);
};
