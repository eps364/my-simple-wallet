import { apiRequest, fetchConfig } from './baseService';
export const loanService = {
  async createLoan(data: any, token?: string) {
    // Formata datas para DD/MM/YYYY
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      // Aceita tanto YYYY-MM-DD quanto DD/MM/YYYY
      if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      return dateStr;
    };
    const dataFormatted = {
      ...data,
      dueDate: formatDate(data.dueDate),
      effectiveDate: formatDate(data.effectiveDate),
      dueDateLoan: formatDate(data.dueDateLoan),
    };
    return apiRequest(
      '/loan',
      fetchConfig('POST', dataFormatted)
    );
  },
};
