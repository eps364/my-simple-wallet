'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface QRCodeReaderProps {
  readonly onScan: (result: string) => void;
  readonly onError?: (error: string) => void;
  readonly isActive: boolean;
  readonly className?: string;
}

export default function QRCodeReader({ onScan, onError, isActive, className = '' }: QRCodeReaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    if (!videoRef.current || !isActive) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        onScan(result.data);
      },
      {
        onDecodeError: (error) => {
          // Não precisamos logar todos os erros de decode, apenas quando não consegue ler
          console.debug('QR decode error:', error);
        },
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment' // Prefer back camera
      }
    );

    setQrScanner(scanner);

    // Verificar se há câmera disponível
    QrScanner.hasCamera().then((hasCamera) => {
      setHasCamera(hasCamera);
      if (!hasCamera) {
        onError?.('Nenhuma câmera encontrada');
        return;
      }

      scanner.start().catch(() => {
        onError?.('Erro ao iniciar a câmera');
      });
    });

    return () => {
      scanner.destroy();
      setQrScanner(null);
    };
  }, [isActive, onScan, onError]);

  useEffect(() => {
    if (!qrScanner) return;

    if (isActive) {
      qrScanner.start().catch(() => {
        onError?.('Erro ao iniciar a câmera');
      });
    } else {
      qrScanner.stop();
    }
  }, [isActive, qrScanner, onError]);

  if (!hasCamera) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Nenhuma câmera encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-64 bg-black rounded-lg object-cover"
        playsInline
        muted
      />
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 border-2 border-blue-500 border-dashed rounded-lg"></div>
        </div>
      )}
    </div>
  );
}
