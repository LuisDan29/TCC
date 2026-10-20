import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Quagga from "@ericblade/quagga2";
import type { QuaggaJSResultObject } from "@ericblade/quagga2";

import { validateISBN } from "../../utils/bookValidation";
import "./BarcodeScanner.css";

const CONFIRMATIONS_NEEDED = 2;
const FRONT_CAMERA_PATTERN = /front|frontal|user|selfie/i;
const CAMERA_STORAGE_KEY = "bibliogestao:scannerCameraId";

type BarcodeScannerProps = {
  onDetected: (isbn: string) => void;
  onClose: () => void;
};

function readSavedCameraId(): string | undefined {
  try {
    return localStorage.getItem(CAMERA_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function saveCameraId(deviceId: string) {
  try {
    localStorage.setItem(CAMERA_STORAGE_KEY, deviceId);
  } catch {
    // armazenamento indisponível: simplesmente não lembra
  }
}

function clearSavedCameraId() {
  try {
    localStorage.removeItem(CAMERA_STORAGE_KEY);
  } catch {
    // armazenamento indisponível: nada a limpar
  }
}

function pickScannerCameras(devices: MediaDeviceInfo[]): MediaDeviceInfo[] {
  const videoInputs = devices.filter((device) => device.kind === "videoinput");
  const rearCameras = videoInputs.filter(
    (device) => !FRONT_CAMERA_PATTERN.test(device.label),
  );

  return rearCameras.length > 0 ? rearCameras : videoInputs;
}

function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const [requestedCameraId, setRequestedCameraId] = useState<
    string | undefined
  >(readSavedCameraId);

  const restoringSavedRef = useRef(requestedCameraId !== undefined);
  const savedCameraFailedRef = useRef(false);

  const [activeCameraId, setActiveCameraId] = useState<string>();
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let started = false;
    let confirmed = false;
    let lastCode = "";
    let hits = 0;

    function handleDetected(result: QuaggaJSResultObject) {
      if (confirmed) return;

      const code = result.codeResult.code;

      if (!code) return;
      if (!/^97[89]\d{10}$/.test(code)) return;
      if (!validateISBN(code)) return;

      if (code === lastCode) {
        hits += 1;
      } else {
        lastCode = code;
        hits = 1;
      }

      if (hits >= CONFIRMATIONS_NEEDED) {
        confirmed = true;
        onDetectedRef.current(code);
      }
    }

    async function loadCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;

        setCameras(pickScannerCameras(devices));
        setActiveCameraId(
          Quagga.CameraAccess.getActiveTrack()?.getSettings().deviceId,
        );
      } catch (error) {
        console.error("Erro ao listar as câmeras:", error);
      }
    }

    function startScanner() {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: containerRef.current ?? undefined,
            constraints: requestedCameraId
              ? { deviceId: { exact: requestedCameraId } }
              : { facingMode: "environment" },
          },
          decoder: { readers: ["ean_reader"] },
        },
        (error) => {
          if (cancelled) {
            if (!error) Quagga.stop();
            return;
          }

          if (error) {
            console.error("Erro ao iniciar a câmera:", error);

            if (restoringSavedRef.current) {
              restoringSavedRef.current = false;
              savedCameraFailedRef.current = true;
              setRequestedCameraId(undefined);
              return;
            }

            savedCameraFailedRef.current = false;

            setActiveCameraId(requestedCameraId);
            setIsStarting(false);
            return;
          }

          restoringSavedRef.current = false;

          if (savedCameraFailedRef.current) {
            savedCameraFailedRef.current = false;
            clearSavedCameraId();
          } else if (requestedCameraId) {
            saveCameraId(requestedCameraId);
          }

          Quagga.onDetected(handleDetected);
          Quagga.start();
          started = true;
          setIsStarting(false);
          void loadCameras();
        },
      );
    }

    const timer = window.setTimeout(startScanner, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);

      if (started) {
        Quagga.offDetected(handleDetected);
        Quagga.stop();
      }
    };
  }, [requestedCameraId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSwitchCamera() {
    if (isStarting || cameras.length < 2) return;

    const currentIndex = cameras.findIndex(
      (camera) => camera.deviceId === activeCameraId,
    );
    const nextCamera = cameras[(currentIndex + 1) % cameras.length];

    setIsStarting(true);
    setRequestedCameraId(nextCamera.deviceId);
  }

  const activeIndex = cameras.findIndex(
    (camera) => camera.deviceId === activeCameraId,
  );

  return createPortal(
    <div
      className="scanner-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="scanner-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Leitor de código de barras"
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong>Aponte para o código de barras</strong>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Fechar"
            onClick={onClose}
          />
        </div>

        <div ref={containerRef} className="scanner-box" />

        {cameras.length > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small aria-live="polite">
              Câmera {Math.max(activeIndex, 0) + 1} de {cameras.length}
            </small>
            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              disabled={isStarting}
              onClick={handleSwitchCamera}
            >
              Trocar câmera
            </button>
          </div>
        )}

        <button
          type="button"
          className="btn btn-light w-100 mt-3"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default BarcodeScanner;
