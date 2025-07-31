"use client";
import React from "react";

interface SubmitButtonProps {
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ label = "Salvar", loading = false, disabled = false, className = "" }) => (
  <button
    type="submit"
    disabled={disabled || loading}
    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 hover:bg-primary-700 text-white ${className}`}
    style={{ backgroundColor: "var(--color-primary)" }}
  >
    {loading ? (
      <span>Carregando...</span>
    ) : (
      label
    )}
  </button>
);
