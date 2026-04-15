'use client';

import { useState, useRef } from 'react';

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: Record<string, string>[]) => void;
  /** CSV每列的表头名称（中文） */
  headers: string[];
  /** 每行数据的字段顺序 */
  fields: string[];
  /** 示例数据第一行 */
  sampleData?: string[][];
}

export default function CsvImportModal({ open, onClose, onImport, headers, fields, sampleData }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        setError('CSV文件至少需要1行表头和1行数据');
        setPreview([]);
        return;
      }
      // Parse CSV (simple comma split, handles basic cases)
      const rows = lines.map(line => {
        const cells: string[] = [];
        let current = '';
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            inQuote = !inQuote;
          } else if (ch === ',' && !inQuote) {
            cells.push(current.trim());
            current = '';
          } else {
            current += ch;
          }
        }
        cells.push(current.trim());
        return cells;
      });
      setPreview(rows.slice(0, 6)); // Show first 6 rows
    };
    reader.readAsText(f);
  };

  const handleImport = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        setError('CSV文件至少需要1行表头和1行数据');
        return;
      }
      // Parse CSV
      const parseRow = (line: string): string[] => {
        const cells: string[] = [];
        let current = '';
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            inQuote = !inQuote;
          } else if (ch === ',' && !inQuote) {
            cells.push(current.trim());
            current = '';
          } else {
            current += ch;
          }
        }
        cells.push(current.trim());
        return cells;
      };

      const headerRow = parseRow(lines[0]);
      // Match headers to fields
      const fieldIndices: number[] = headers.map((h, i) => {
        const idx = headerRow.findIndex(col => col.includes(h) || h.includes(col));
        return idx;
      });

      const data: Record<string, string>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cells = parseRow(lines[i]);
        if (cells.every(c => !c)) continue; // skip empty rows
        const record: Record<string, string> = {};
        fields.forEach((field, fi) => {
          const idx = fieldIndices[fi];
          record[field] = idx >= 0 && idx < cells.length ? cells[idx] : '';
        });
        data.push(record);
      }

      if (data.length === 0) {
        setError('未找到有效数据');
        return;
      }
      onImport(data);
      onClose();
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">导入CSV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div className="p-5 flex-1 overflow-auto">
          {/* 文件选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择CSV文件</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* 预览 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}

          {preview.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">预览（前{preview.length}行）</div>
              <div className="overflow-auto border rounded">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="border bg-gray-50 px-2 py-1 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(1).map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border px-2 py-1 whitespace-nowrap">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 说明 */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
            <div className="font-medium text-gray-700 mb-1">导入说明：</div>
            <ul className="list-disc list-inside space-y-0.5">
              <li>CSV文件第一行为表头，需要包含以下列：{headers.join(' / ')}</li>
              <li>系统会根据表头自动匹配字段</li>
              <li>支持从秒账导出的CSV格式</li>
              <li>导入后数据保存在本地模拟缓存中（重启后需要重新导入）</li>
            </ul>
          </div>
        </div>

        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleImport} disabled={!file || preview.length < 2}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            导入{preview.length > 1 ? `(${preview.length - 1}条)` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
