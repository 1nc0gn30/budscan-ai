import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Zap, ShieldAlert, CheckCircle2, AlertTriangle, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyzeBud, ScanResult } from '@/src/services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const API_KEY_STORAGE_KEY = 'budscan_gemini_api_key';

interface ScannerProps {
  onPost: (result: ScanResult, image: string) => void;
}

export default function Scanner({ onPost }: ScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE_KEY) || '');

  const capture = useCallback(async () => {
    if (!apiKey.trim()) {
      toast.error('Add your Gemini API key to run analysis.');
      return;
    }

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast.error('Failed to capture image');
      return;
    }

    setCapturedImage(imageSrc);
    setIsScanning(true);
    setScanResult(null);

    try {
      const base64Data = imageSrc.split(',')[1];
      const result = await analyzeBud(base64Data, apiKey.trim());
      setScanResult(result);
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('AI analysis failed. Check your API key and try again.');
      setCapturedImage(null);
    } finally {
      setIsScanning(false);
    }
  }, [apiKey]);

  const saveKey = () => {
    if (!apiKey.trim()) {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      return;
    }
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
    toast.success('API key saved locally on this browser.');
  };

  const reset = () => {
    setScanResult(null);
    setCapturedImage(null);
  };

  const handlePost = () => {
    if (scanResult && capturedImage) {
      onPost(scanResult, capturedImage);
      reset();
      toast.success('Result posted to feed!');
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'fire': return 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10';
      case 'suspect': return 'text-amber-400 border-amber-400/50 bg-amber-400/10';
      case 'moldy': return 'text-red-400 border-red-400/50 bg-red-400/10';
      case 'pgr': return 'text-purple-400 border-purple-400/50 bg-purple-400/10';
      default: return 'text-slate-400 border-slate-400/50 bg-slate-400/10';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'fire': return <Zap className="w-5 h-5" />;
      case 'suspect': return <AlertTriangle className="w-5 h-5" />;
      case 'moldy': return <ShieldAlert className="w-5 h-5" />;
      case 'pgr': return <ShieldAlert className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-md mx-auto h-full overflow-hidden">
      <div className="bg-slate-900/80 border border-emerald-500/20 rounded-xl p-3 space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Bring Your Own Key</div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Gemini API key"
              className="w-full h-10 rounded-lg bg-black/40 border border-slate-700 pl-9 pr-3 text-sm text-white"
            />
          </div>
          <Button type="button" onClick={saveKey} className="h-10 bg-emerald-600 hover:bg-emerald-500">
            Save
          </Button>
        </div>
      </div>

      <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-500/20 bg-black shadow-2xl shadow-emerald-500/5">
        {!capturedImage ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment' }}
              onUserMedia={() => setCameraReady(true)}
              className="w-full h-full object-cover"
              mirrored={false}
              imageSmoothing={true}
              forceScreenshotSourceSize={false}
              disablePictureInPicture={true}
              onUserMediaError={(err) => console.error(err)}
              screenshotQuality={0.92}
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 rounded-br-lg" />

              {isScanning && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10"
                />
              )}
            </div>
          </>
        ) : (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}

        {isScanning && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <div className="text-emerald-500 font-mono text-sm animate-pulse">ANALYZING SPECIMEN...</div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <AnimatePresence mode="wait">
          {!scanResult ? (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4"
            >
              {!capturedImage ? (
                <Button
                  onClick={capture}
                  disabled={!cameraReady || isScanning}
                  className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-900/20"
                >
                  <Camera className="w-6 h-6 mr-2" />
                  SCAN BUD
                </Button>
              ) : (
                <Button
                  onClick={reset}
                  variant="outline"
                  className="h-16 rounded-2xl border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                >
                  <RefreshCw className="w-6 h-6 mr-2" />
                  RETRY SCAN
                </Button>
              )}

              <div className="text-center text-xs text-slate-500 font-mono uppercase tracking-widest">
                Position bud in center for optimal analysis
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-4 overflow-y-auto pr-1"
            >
              <Card className="bg-slate-900/50 border-emerald-500/20 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getQualityColor(scanResult.quality)}`}>
                      {getQualityIcon(scanResult.quality)}
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase">Status</div>
                      <div className={`font-bold uppercase tracking-tighter text-xl ${getQualityColor(scanResult.quality).split(' ')[0]}`}>
                        {scanResult.quality}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Confidence</div>
                    <div className="font-mono text-emerald-500">{(scanResult.confidence * 100).toFixed(1)}%</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-slate-300 leading-relaxed italic">
                    "{scanResult.details}"
                  </div>

                  {scanResult.terpenes && scanResult.terpenes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {scanResult.terpenes.map(t => (
                        <Badge key={t} variant="outline" className="text-[10px] bg-emerald-500/5 border-emerald-500/20 text-emerald-400">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {scanResult.warnings.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                    <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase mb-1">
                      <ShieldAlert className="w-3 h-3" />
                      Safety Warnings
                    </div>
                    <ul className="text-[10px] text-red-300/80 list-disc list-inside">
                      {scanResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </Card>

              <div className="flex gap-2">
                <Button onClick={reset} variant="outline" className="flex-1 rounded-xl border-slate-700 text-slate-400">
                  DISCARD
                </Button>
                <Button onClick={handlePost} className="flex-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  POST TO FEED
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
