import React, { ReactNode } from "react";
import { useThemeStyles } from "@/lib/hooks/useThemeStyles";

interface ContainerHeaderProps {
  children: ReactNode;
}

const ContainerHeader: React.FC<ContainerHeaderProps> = ({ children }) => {
  const styles = useThemeStyles();
  return (
    <div
      className="container mx-auto px-4 max-w-5xl"
      style={{
        backgroundColor: styles.surface.backgroundColor,
        borderColor: styles.border.borderColor
      }}
    >
      {children}
    </div>
  );
};

export default ContainerHeader;
