"use client";
import { useState, useEffect } from 'react';

const PARENT_MONITORING_KEY = 'familyManagementEnabled';

export function useFamilyManagement() {
  const [isManagementEnabled, setIsManagementEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar estado do localStorage ao inicializar
    const savedState = localStorage.getItem(PARENT_MONITORING_KEY);
    setIsManagementEnabled(savedState === 'true');
    setIsLoading(false);
  }, []);

  const toggleManagement = (enabled: boolean) => {
    setIsManagementEnabled(enabled);
    localStorage.setItem(PARENT_MONITORING_KEY, enabled.toString());
  };

  const enableManagement = () => toggleManagement(true);
  const disableManagement = () => toggleManagement(false);

  return {
    isManagementEnabled,
    isLoading,
    toggleManagement,
    enableManagement,
    disableManagement
  };
}

// Alias para compatibilidade
export const useParentMonitoring = useFamilyManagement;
