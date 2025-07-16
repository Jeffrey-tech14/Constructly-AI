import * as XLSX from 'xlsx';

export const generateQuoteExcel = async ({ quote, isClientExport = false }: {
  quote: any;
  isClientExport?: boolean;
}) => {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ['Project Title', quote.title],
    ['Client Name', quote.client_name],
    ['Location', quote.location],
    ['Date Generated', new Date().toLocaleDateString()],
    ['Total Amount', quote.total_amount]
  ];

  if (!isClientExport) {
    summaryData.push(['Profit Margin', quote.profit_amount]);
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Sheet 2: Materials
  if (quote.materials?.length > 0 && !isClientExport) {
    const materialsData = [
      ['Material', 'Quantity', 'Unit Price', 'Total'],
      ...quote.materials.map(mat => [mat.name, mat.quantity, mat.unit_price, mat.total_price])
    ];
    const wsMaterials = XLSX.utils.aoa_to_sheet(materialsData);
    XLSX.utils.book_append_sheet(wb, wsMaterials, 'Materials');
  }

  // Sheet 3: Equipment
  if (quote.equipment?.length > 0 && !isClientExport) {
    const equipmentData = [
      ['Equipment', 'Days', 'Daily Rate', 'Total Cost'],
      ...quote.equipment.map(eq => [eq.name, eq.days, eq.daily_rate, eq.total_cost])
    ];
    const wsEquipment = XLSX.utils.aoa_to_sheet(equipmentData);
    XLSX.utils.book_append_sheet(wb, wsEquipment, 'Equipment');
  }

  // Sheet 4: Services
  if (quote.addons?.length > 0 && !isClientExport) {
    const servicesData = [
      ['Service', 'Price'],
      ...quote.addons.map(svc => [svc.name, svc.price])
    ];
    const wsServices = XLSX.utils.aoa_to_sheet(servicesData);
    XLSX.utils.book_append_sheet(wb, wsServices, 'Services');
  }

  // Sheet 5: Final Summary
  const finalSummaryData = [
    ['Total Amount', quote.total_amount],
    ['Overhead', quote.overhead_amount],
    ['Contingency', quote.contingency_amount],
    ['Permit Cost', quote.permit_cost]
  ];

  if (!isClientExport) {
    finalSummaryData.push(['Profit Margin', quote.profit_amount]);
  }

  const wsFinal = XLSX.utils.aoa_to_sheet(finalSummaryData);
  XLSX.utils.book_append_sheet(wb, wsFinal, 'Final Summary');

  // Save file
  XLSX.writeFile(wb, `${isClientExport ? 'Client' : 'Contractor'}_Quote_${quote.title.replace(/\s+/g, '_')}.xlsx`);
};