"use client";

import { useState } from 'react';

export type DateFilterType = 'dueDate' | 'effectiveDate';

export function useDateFilter(initialFilter: DateFilterType = 'dueDate') {
  const [dateFilter, setDateFilter] = useState<DateFilterType>(initialFilter);

  return {
    dateFilter,
    setDateFilter,
  };
}
