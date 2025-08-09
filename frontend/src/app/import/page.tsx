"use client";

import { Transaction } from '@/lib/types/transaction';
import { useState } from 'react';
// ...import XLSX removido...
import { FormFeedback } from '@/components/ui/FormFeedback';
import { SubmitButton } from '@/components/ui/SubmitButton';
import Container from '@/components/layout/Container';

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
  // ...lógica de importação XLSX removida...
  setError('Importação XLSX removida do sistema');
    } catch {
      setError('Erro ao importar arquivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className="text-2xl font-bold mb-4">Importar Transações</h1>
      <form
        className="mb-4 flex items-center gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleImport();
        }}
      >
  {/* Importação XLSX removida */}
      </form>
  {/* Importação e preview XLSX removidos */}
    </Container>
  );
}
