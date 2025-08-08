import React from "react";
import { useThemeStyles } from "@/lib/hooks/useThemeStyles";

const Footer: React.FC = () => {
  const styles = useThemeStyles();
  return (
    <footer className="text-center py-8">
      <p style={styles.textMuted}>
        &copy; {new Date().getFullYear()} Simple Wallet.
      </p>
    </footer>
  );
};

export default Footer;
