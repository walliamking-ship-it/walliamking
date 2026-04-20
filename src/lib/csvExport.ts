/**
 * CSV 导出工具 - 支持导出数据和导出空模版
 */

/** 导出 CSV 数据（带表头） */
export function exportCsv(
  headers: string[],
  rows: Record<string, string | number | undefined>[],
  filename: string
) {
  const csv = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        // 如果值包含逗号、引号或换行，需要用引号包裹
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    )
  ].join('\n');

  downloadCsv(csv, `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
}

/** 导出 CSV 空模版（只有表头） */
export function exportCsvTemplate(headers: string[], filename: string) {
  const csv = [headers.join(',')];
  downloadCsv(csv, `${filename}_模版_${new Date().toISOString().slice(0, 10)}.csv`);
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
