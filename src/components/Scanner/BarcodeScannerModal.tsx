import React, { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, X, CheckCircle2, Zap, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLibrary } from '../../context/LibraryContext';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (code: string) => void;
  title?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  title = 'Real-Time Barcode & QR Scanner'
}) => {
  const { addToast } = useLibrary();
  const [scannedCode, setScannedCode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let html5Qrcode: Html5Qrcode | null = null;

    if (isOpen) {
      setScannedCode('');
      setCameraError(null);

      // Initialize scanner after DOM renders #qr-reader
      const timer = setTimeout(() => {
        const qrElement = document.getElementById('qr-reader');
        if (qrElement) {
          try {
            html5Qrcode = new Html5Qrcode('qr-reader');
            html5QrcodeRef.current = html5Qrcode;

            Html5Qrcode.getCameras()
              .then(cameras => {
                if (cameras && cameras.length > 0) {
                  setAvailableCameras(cameras);
                  // Choose back camera if available, else first camera
                  const selectedCam = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment')) || cameras[0];
                  setActiveCameraId(selectedCam.id);

                  html5Qrcode
                    ?.start(
                      selectedCam.id,
                      {
                        fps: 10,
                        qrbox: { width: 250, height: 160 },
                        aspectRatio: 1.777
                      },
                      (decodedText) => {
                        handleSuccessfulScan(decodedText);
                      },
                      () => {
                        // Ignore frame parse errors during scanning
                      }
                    )
                    .then(() => setIsScanning(true))
                    .catch(err => {
                      console.warn('Camera start error:', err);
                      setCameraError('Unable to access camera stream. Check browser permissions.');
                      setIsScanning(false);
                    });
                } else {
                  setCameraError('No video camera detected on this device.');
                }
              })
              .catch(err => {
                console.warn('Get cameras error:', err);
                setCameraError('Camera access denied or restricted by browser context.');
              });
          } catch (e) {
            console.error('Failed to instantiate Html5Qrcode:', e);
          }
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
          html5QrcodeRef.current
            .stop()
            .then(() => html5QrcodeRef.current?.clear())
            .catch(err => console.error('Failed to stop html5Qrcode:', err));
        }
      };
    }
  }, [isOpen]);

  const handleSuccessfulScan = (code: string) => {
    setScannedCode(code);
    addToast('Barcode Detected!', `Scanned Code: ${code}`, 'success');

    // Stop scanner
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      html5QrcodeRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
          onScanComplete(code);
          onClose();
        })
        .catch(() => {
          onScanComplete(code);
          onClose();
        });
    } else {
      onScanComplete(code);
      onClose();
    }
  };

  const switchCamera = (cameraId: string) => {
    if (html5QrcodeRef.current && isScanning) {
      html5QrcodeRef.current.stop().then(() => {
        setActiveCameraId(cameraId);
        html5QrcodeRef.current
          ?.start(
            cameraId,
            { fps: 10, qrbox: { width: 250, height: 160 } },
            (text) => handleSuccessfulScan(text),
            () => {}
          )
          .then(() => setIsScanning(true));
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div key="scanner-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          key="scanner-modal-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-base">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time HTML5 Camera Viewfinder Box */}
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500/40 flex flex-col items-center justify-center text-center p-2">
            <div id="qr-reader" className="w-full h-full overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center" />

            {/* Error or Fallback Overlay */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/90 p-4 flex flex-col items-center justify-center text-center space-y-2 z-10">
                <AlertCircle className="w-8 h-8 text-amber-500 animate-bounce" />
                <p className="text-xs text-slate-200 font-semibold">{cameraError}</p>
                <p className="text-[10px] text-slate-400">
                  You can type the Book ID / ISBN manually below.
                </p>
              </div>
            )}

            {/* Active Camera Controls */}
            {availableCameras.length > 1 && isScanning && (
              <div className="absolute bottom-2 right-2 z-20">
                <select
                  value={activeCameraId || ''}
                  onChange={e => switchCamera(e.target.value)}
                  className="bg-slate-900/80 backdrop-blur border border-slate-700 text-slate-200 text-[10px] py-1 px-2 rounded-lg outline-none"
                >
                  {availableCameras.map((c, idx) => (
                    <option key={`cam-opt-${c.id}-${idx}`} value={c.id}>
                      {c.label || `Camera ${c.id.substring(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Manual Input Fallback */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Or type Book ID / ISBN (e.g. BK-1001)..."
              value={scannedCode}
              onChange={e => setScannedCode(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono text-slate-900 dark:text-white"
            />
            <button
              onClick={() => {
                if (scannedCode.trim()) {
                  handleSuccessfulScan(scannedCode.trim());
                }
              }}
              disabled={!scannedCode.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Apply
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

