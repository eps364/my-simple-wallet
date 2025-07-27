'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  readonly value: string;
  readonly size?: number;
  readonly className?: string;
}

export default function QRCodeGenerator({ value, size = 150, className = '' }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then(() => {
      })
      .catch((error: unknown) => {
      });
    }
  }, [value, size]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = value;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        // Fallback method for older browsers
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-300 transition-colors bg-white" 
          onClick={handleCopyToClipboard}
          title="Clique para copiar o ID"
          width={size}
          height={size}
        />
        {copied && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded z-10">
            Copiado!
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center break-all max-w-32">
        ID: {value}
      </p>
    </div>
  );
}
