// XLSX utility that uses the CDN-loaded SheetJS (window.XLSX)
// The CDN script is loaded lazily on first use

function loadXLSX(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).XLSX) {
      resolve((window as any).XLSX);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve((window as any).XLSX);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function exportToExcel(
  data: Record<string, string | number>[],
  sheetName: string,
  filename: string,
) {
  const XLSX = await loadXLSX();
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export async function exportToExcelMultiSheet(
  sheets: { name: string; data: Record<string, string | number>[] }[],
  filename: string,
) {
  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }
  XLSX.writeFile(wb, filename);
}
