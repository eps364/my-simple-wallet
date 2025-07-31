"use client";
import React from "react";

interface FormFeedbackProps {
  message: string;
  type?: "error" | "success";
  className?: string;
}

export const FormFeedback: React.FC<FormFeedbackProps> = ({ message, type = "error", className = "" }) => {
  const baseStyle =
    type === "error"
      ? {
          backgroundColor: "#fef2f2",
          borderColor: "#fca5a5",
          color: "#dc2626"
        }
      : {
          backgroundColor: "#ecfdf5",
          borderColor: "#6ee7b7",
          color: "#059669"
        };
  return (
    <div
      className={`border px-4 py-3 rounded text-sm ${className}`}
      style={baseStyle}
      role={type === "error" ? "alert" : undefined}
      {...(type !== "error" ? { as: "output" } : {})}
    >
      {message}
    </div>
  );
};
