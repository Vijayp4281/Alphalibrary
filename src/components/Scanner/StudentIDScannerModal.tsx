import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, CheckCircle2, AlertCircle, RefreshCw, Smartphone, CreditCard, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface StudentIDScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (barcode: string) => void;
  title?: string;
}

export const StudentIDScannerModal: React.FC<StudentIDScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  title = 'Scan Student College ID Card Barcode'
}) => {
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  // Sound effect generator for barcode scan confirmation
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, audioCtx.currentTime); // A6 note
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  useEffect(() => {
    let html5Qrcode: Html5Qrcode | null = null;

    if (isOpen) {
      setManualBarcode('');
      setCameraError(null);

      // Initialize scanner after DOM renders #student-id-reader
      const timer = setTimeout(() => {
        const qrElement = document.getElementById('student-id-reader');
        if (qrElement) {
          try {
            // Explicitly support CODE_128 for student ID cards along with other standard barcode formats
            html5Qrcode = new Html5Qrcode('student-id-reader', {
              formatsToSupport: [
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.QR_CODE
              ],
              verbose: false
            });
            html5QrcodeRef.current = html5Qrcode;

            Html5Qrcode.getCameras()
              .then(cameras => {
                if (cameras && cameras.length > 0) {
                  setAvailableCameras(cameras);
                  // Choose back / environment camera if available
                  const selectedCam =
                    cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment')) ||
                    cameras[0];
                  setActiveCameraId(selectedCam.id);

                  html5Qrcode
                    ?.start(
                      selectedCam.id,
                      {
                        fps: 15,
                        qrbox: { width: 280, height: 140 },
                        aspectRatio: 1.777
                      },
                      decodedText => {
                        handleSuccessfulScan(decodedText);
                      },
                      () => {
                        // Suppress frame parse noise during live video
                      }
                    )
                    .then(() => setIsScanning(true))
                    .catch(err => {
                      console.warn('Student ID camera start notice:', err);
                      setCameraError('Unable to access camera feed. Please check browser camera permissions or type barcode below.');
                      setIsScanning(false);
                    });
                } else {
                  setCameraError('No video camera detected on this device. You can type or paste the Student ID Barcode manually.');
                }
              })
              .catch(err => {
                console.warn('Get cameras error:', err);
                setCameraError('Camera access blocked by browser policy. Please allow camera access in your browser settings.');
              });
          } catch (e) {
            console.error('Failed to instantiate Html5Qrcode for student ID:', e);
          }
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
          html5QrcodeRef.current
            .stop()
            .then(() => html5QrcodeRef.current?.clear())
            .catch(err => console.warn('Clean up student id scanner notice:', err));
        }
      };
    }
  }, [isOpen]);

  const handleSuccessfulScan = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    playScanBeep();

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
            { fps: 15, qrbox: { width: 280, height: 140 } },
            text => handleSuccessfulScan(text),
            () => {}
          )
          .then(() => setIsScanning(true));
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        key="student-scanner-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
      >
        <motion.div
          key="student-scanner-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#0E1726] border border-[#24324A] rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#24324A] pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  {title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Align Student ID Card Barcode (CODE128) in the viewfinder
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#162238] hover:bg-[#1f2f4c] text-slate-400 hover:text-white border border-[#24324A] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time HTML5 Camera Viewfinder Box */}
          <div className="relative aspect-[16/10] bg-black rounded-2xl overflow-hidden border-2 border-emerald-500/40 flex flex-col items-center justify-center text-center shadow-2xl">
            <div
              id="student-id-reader"
              className="w-full h-full overflow-hidden rounded-xl bg-black flex items-center justify-center"
            />

            {/* Target ID Card Overlay Guides */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-[78%] h-[58%] border border-emerald-400/40 rounded-xl bg-emerald-950/10 flex flex-col items-center justify-between p-2">
                {/* 4 Corner Markers */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br" />

                {/* Laser Scanning Bar Animation */}
                <motion.div
                  animate={{ y: [0, 80, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                />

                <div className="text-[10px] font-mono font-bold text-emerald-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  CODE128 BARCODE ZONE
                </div>
              </div>
            </div>

            {/* Error or Fallback Overlay */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/92 p-5 flex flex-col items-center justify-center text-center space-y-2 z-10">
                <AlertCircle className="w-9 h-9 text-amber-400 animate-bounce" />
                <p className="text-xs text-slate-200 font-semibold max-w-sm">{cameraError}</p>
                <p className="text-[11px] text-slate-400">
                  You can type or paste the Barcode ID (e.g. 2503713820521058) manually below.
                </p>
              </div>
            )}

            {/* Active Camera Selector */}
            {availableCameras.length > 1 && isScanning && (
              <div className="absolute bottom-2 right-2 z-20">
                <select
                  value={activeCameraId || ''}
                  onChange={e => switchCamera(e.target.value)}
                  className="bg-slate-900/90 backdrop-blur border border-slate-700 text-slate-200 text-[10px] font-semibold py-1 px-2 rounded-lg outline-none cursor-pointer"
                >
                  {availableCameras.map((c, idx) => (
                    <option key={`cam-opt-stu-${c.id}-${idx}`} value={c.id}>
                      {c.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Manual Barcode Input Fallback */}
          <div className="pt-2 border-t border-[#24324A] flex gap-2">
            <div className="relative flex-1">
              <ScanLine className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Or type/paste Barcode Value (e.g. 2503713820521058)..."
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && manualBarcode.trim()) {
                    e.preventDefault();
                    handleSuccessfulScan(manualBarcode.trim());
                  }
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#111C2E] border border-[#24324A] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono font-bold text-white placeholder-slate-500"
              />
            </div>
            <button
              onClick={() => {
                if (manualBarcode.trim()) {
                  handleSuccessfulScan(manualBarcode.trim());
                }
              }}
              disabled={!manualBarcode.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" /> Apply Barcode
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
