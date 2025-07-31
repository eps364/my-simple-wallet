"use client";

import { Transaction } from '@/lib/types/transaction';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { FormFeedback } from '@/components/ui/FormFeedback';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default function ImportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imported, setImported] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setImported(false);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: Transaction[] = XLSX.utils.sheet_to_json(worksheet);
      setTransactions(json);
      setImported(true);
    } catch {
      setError('Erro ao importar arquivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Importar Transações</h1>
      <div className="mb-4 flex items-center gap-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="border px-2 py-1 rounded"
        />
        <SubmitButton
          label="Importar XLSX"
          loading={loading}
          disabled={!file}
          className="flex items-center gap-2 px-4 py-2 mt-4"
        />
      </div>
      {imported && <FormFeedback message="Arquivo importado com sucesso!" type="success" />}
      {error && <FormFeedback message={error} type="error" />}
      {/* Preview dos dados importados */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              {transactions[0] && Object.keys(transactions[0]).map(key => (
                <th key={key} className="border px-2 py-1">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={tx.id || idx}>
                {Object.entries(tx).map(([key, val]) => (
                  <td key={key} className="border px-2 py-1">{val === null || val === undefined ? "" : (typeof val === 'string' || typeof val === 'number' ? val : JSON.stringify(val))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
