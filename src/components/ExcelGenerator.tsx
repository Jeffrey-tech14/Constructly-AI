import * as XLSX from 'xlsx';

export const generateQuoteExcel = async ({ quote, isClientExport = false }: {
  quote: any;
  isClientExport?: boolean;
}) => {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Project Title', quote.title],
    ['Client Name', quote.client_name],
    ['Location', quote.location],
    ['House Type', quote.house_type],
    ['Date Generated', new Date().toLocaleDateString()],
    ['Total Amount', quote.total_amount]
  ];

  if (!isClientExport) {
    summaryData.push(
      ['Overhead', quote.overhead_amount],
      ['Contingency', quote.contingency_amount],
      ['Permit Cost', quote.permit_cost],
      ['Profit Margin', quote.profit_amount]
    );
  }

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

  // Materials
  if (quote.materials?.length && !isClientExport) {
    const materialsData = [['Material', 'Total Price'], ...quote.materials.map(m => [m.name, m.total_price])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(materialsData), 'Materials');
  }

  // Equipment
  if (quote.equipment?.length && !isClientExport) {
    const equipmentData = [['Equipment', 'Days', 'Daily Rate', 'Total'], ...quote.equipment.map(e => [e.name, e.days, e.daily_rate, e.total_cost])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(equipmentData), 'Equipment');
  }

  // Services
  if (quote.addons?.length && !isClientExport) {
    const servicesData = [['Service', 'Price'], ...quote.addons.map(s => [s.name, s.price])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(servicesData), 'Services');
  }

  // Transport
  if (quote.distance_km && !isClientExport) {
    const transportData = [
      ['Distance (km)', 'Transport Cost'],
      [quote.distance_km, quote.transport_costs]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(transportData), 'Transport');
  }

  // Save file
  XLSX.writeFile(wb, `${isClientExport ? 'Client' : 'Contractor'}_Quote_${quote.title.replace(/\s+/g, '_')}.xlsx`);
};