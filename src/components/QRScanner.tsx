"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (payload: string) => void;
}

type DetectorSource = HTMLVideoElement | ImageBitmap | HTMLCanvasElement | HTMLImageElement;

interface BarcodeDetectionResult {
  rawValue?: string;
}

interface BarcodeDetectorInstance {
  detect: (source: DetectorSource) => Promise<BarcodeDetectionResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
}

declare global {
  interface Window {
    BarcodeDetector: BarcodeDetectorConstructor;
  }
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [manualJson, setManualJson] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setManualJson("");
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      setError("Camera preview unavailable.");
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      if (!isSupported) {
        return;
      }
      try {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        detectorRef.current = detector;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        videoElement.srcObject = stream;
        await videoElement.play();

        const detect = async () => {
          if (cancelled || !detectorRef.current) {
            return;
          }
          try {
            const detections = await detectorRef.current.detect(videoElement as DetectorSource);
            if (detections.length > 0) {
              const value = detections[0]?.rawValue;
              if (value) {
                onScan(value);
                onClose();
                return;
              }
            }
          } catch (scanError) {
            setError((scanError as Error).message);
          }
          animationRef.current = window.requestAnimationFrame(detect);
        };

        detect();
      } catch (cameraError) {
        const message = cameraError instanceof Error ? cameraError.message : "Camera access denied";
        setError(message);
      }
    };

    startScanner();

    return () => {
        cancelled = true;
        if (animationRef.current !== undefined) {
          window.cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
      const { current: stream } = streamRef;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      videoElement.pause();
      videoElement.srcObject = null;
      detectorRef.current = null;
    };
  }, [isOpen, isSupported, onClose, onScan]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!(typeof window !== "undefined" && "BarcodeDetector" in window)) {
      setError("QR detection is not supported on this device.");
      return;
    }
    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const bitmap = await createImageBitmap(file);
      const detections = await detector.detect(bitmap);
      if (detections.length > 0) {
        const value = detections[0]?.rawValue;
        if (value) {
          onScan(value);
          onClose();
          event.target.value = "";
          return;
        }
      }
      setError("No QR code found in the selected image.");
    } catch (fileError) {
      const message = fileError instanceof Error ? fileError.message : "Unable to read the image.";
      setError(message);
    }
    event.target.value = "";
  };

  const handleManualSubmit = () => {
    const trimmed = manualJson.trim();
    if (!trimmed) {
      setError("Paste QR JSON payload first.");
      return;
    }
    try {
      JSON.parse(trimmed);
      onScan(trimmed);
      onClose();
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : "Invalid JSON";
      setError(message);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Scan ticket QR</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            Close
          </button>
        </div>
        <div className="grid gap-6 px-6 py-6">
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            {isSupported ? (
              <video
                ref={videoRef}
                className="h-64 w-full object-cover"
                muted
                playsInline
                autoPlay
              />
            ) : (
              <div className="flex h-64 w-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
                <span className="font-medium text-slate-700">Live scanning not supported</span>
                <span>Use the upload or paste JSON fallback options below.</span>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <div className="grid gap-3 text-sm">
            <label className="font-semibold text-slate-700">Upload QR image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="text-sm"
            />
          </div>
          <div className="grid gap-3 text-sm">
            <label className="font-semibold text-slate-700">Paste QR JSON payload</label>
            <textarea
              value={manualJson}
              onChange={(event) => setManualJson(event.target.value)}
              rows={4}
              placeholder='{"ticketId":1,"owner":"0x..."}'
              className="w-full resize-none rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleManualSubmit}
              className="self-end rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Apply Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}