'use client';

import { useState, useRef } from 'react';

export interface Column<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface CrudTableProps<T extends { id: string }> {
  title: string;
  columns: Column<T>[];
  data: T[];
  onAdd: (data: Omit<T, 'id'>) => void | Promise<void>;
  onEdit: (id: string, data: Partial<T>) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  formFields: (props: {
    value: Partial<T>;
    onChange: (key: keyof T, value: any) => void;
    isEdit?: boolean;
  }) => React.ReactNode;
  emptyMessage?: string;
  /** 搜索框模糊匹配的字段 */
  searchKeys?: (keyof T)[];
  /** 导出CSV的表头标签（不含操作列） */
  exportHeaders?: { key: keyof T; label: string }[];
}

export function CrudTable<T extends { id: string }>({
  title, columns, data, onAdd, onEdit, onDelete,
  formFields, emptyMessage = '暂无数据',
  searchKeys, exportHeaders,
}: CrudTableProps<T>) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValue, setFormValue] = useState<Partial<T>>({});
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // 模糊搜索
  const filtered = search.trim() && searchKeys
    ? data.filter(item =>
        searchKeys.some(k => {
          const v = (item as any)[k];
          return v && String(v).toLowerCase().includes(search.toLowerCase());
        })
      )
    : data;

  const openAdd = () => { setError(''); setEditingId(null); setFormValue({}); setShowModal(true); };
  const openEdit = (item: T) => { setError(''); setEditingId(item.id); setFormValue({ ...item }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await onEdit(editingId, formValue as Partial<T>);
      } else {
        await onAdd(formValue as Omit<T, 'id'>);
      }
      setShowModal(false);
    } catch (e: any) {
      setError(e.message || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof T, value: any) => {
    setFormValue(prev => ({ ...prev, [key]: value }));
  };

  // 导出CSV
  const handleExport = () => {
    if (!exportHeaders || exportHeaders.length === 0) return;
    const headers = exportHeaders.map(h => h.label).join(',');
    const rows = filtered.map(item =>
      exportHeaders.map(h => {
        const v = (item as any)[h.key];
        return `"${v == null ? '' : String(v).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入CSV
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg('');
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) { setImportMsg('CSV内容为空或格式错误'); return; }
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      let imported = 0, failed = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/("([^"]|"")*"|[^,]*)/g) || [];
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = (values[idx] || '').replace(/^"|"$/g, '').replace(/""/g, '"'); });
        // 找id字段（跳过）
        const { id: _id, ...data } = row as any;
        try {
          await onAdd(data as Omit<T, 'id'>);
          imported++;
        } catch {
          failed++;
        }
      }
      setImportMsg(`成功导入 ${imported} 条${failed > 0 ? `，失败 ${failed} 条` : ''}`);
    } catch (err: any) {
      setImportMsg('导入失败: ' + (err.message || '未知错误'));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="p-6">
      {/* 顶部工具栏 */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <button onClick={handleExport} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">
            📥 导出
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={importing} className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-600 disabled:opacity-50">
            {importing ? '导入中…' : '📤 导入'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">
            + 新增
          </button>
        </div>
      </div>

      {/* 搜索栏 */}
      {searchKeys && searchKeys.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            placeholder={`搜索 ${searchKeys.map(k => String(k)).join(' / ')}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      )}

      {importMsg && (
        <div className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
          {importMsg}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-gray-400 text-center py-8">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th key={String(col.key)} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-100">
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm text-gray-800">
                      {col.key === 'actions' ? (
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline text-sm">编辑</button>
                          <button onClick={async () => {
                            if (confirm('确认删除？')) {
                              await onDelete(item.id);
                            }
                          }} className="text-red-600 hover:underline text-sm">删除</button>
                        </div>
                      ) : col.render ? (
                        col.render(item)
                      ) : (
                        String((item as any)[col.key] ?? '')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {search && <p className="text-sm text-gray-500 mt-2">共 {filtered.length} 条匹配结果</p>}
        </div>
      )}

      {/* 弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? '编辑' : '新增'} {title}</h2>
            {error && (
              <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
            )}
            <div className="space-y-3">
              {formFields({ value: formValue, onChange: handleChange, isEdit: !!editingId })}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">取消</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
