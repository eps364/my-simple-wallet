import { apiRequest, fetchConfig } from "./baseService";
interface LoanData {
  dueDate?: string;
  effectiveDate?: string;
  dueDateLoan?: string;
  [key: string]: string | undefined;
}

export const loanService = {
  async createLoan(data: LoanData) {
    const formatDate = (dateStr: string | undefined) => {
      if (!dateStr) return "";

      if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const [year, month, day] = dateStr.split("-");
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
    return apiRequest("/loan", fetchConfig("POST", dataFormatted));
  },
};
