import React, { ReactNode } from "react";
import { useThemeStyles } from "@/lib/hooks/useThemeStyles";

interface ContainerProps {
  children: ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  const styles = useThemeStyles();
  return (
    <div
      className="responsive-container mx-auto py-8 min-h-screen max-w-5xl"
      style={{
        background: `linear-gradient(135deg, 
          ${styles.surface.backgroundColor}CC 0%, 
          ${styles.primary.backgroundColor}22 100%)`
      }}
    >
      {children}
    </div>
  );
};

export default Container;
