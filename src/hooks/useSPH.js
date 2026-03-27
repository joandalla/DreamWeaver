import { useEffect, useRef, useState, useCallback } from 'react';

export function useSPH(params, width = 1024, height = 768) {
  const workerRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../engine/sph/sph.worker.js', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'update') {
          setParticles(e.data.particles);
        } else if (e.data.type === 'initDone') {
          setIsReady(true);
        } else if (e.data.type === 'error') {
          setError(e.data.error);
        }
      };

      workerRef.current.onerror = (err) => {
        setError(err.message);
      };

      workerRef.current.postMessage({
        type: 'init',
        data: { params, width, height }
      });

    } catch (err) {
      setError(err.message);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const addParticle = useCallback((pos, vel, color) => {
    if (workerRef.current && isReady) {
      workerRef.current.postMessage({
        type: 'addParticle',
        data: { pos, vel, color }
      });
    }
  }, [isReady]);

  const startSimulation = useCallback((dt = 0.016) => {
    if (workerRef.current && isReady) {
      workerRef.current.postMessage({ type: 'start', data: { dt } });
    }
  }, [isReady]);

  const stopSimulation = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'stop' });
    }
  }, []);

  return { particles, error, isReady, addParticle, startSimulation, stopSimulation };
}