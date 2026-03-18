import { useEffect, useRef } from 'react';
import p5 from 'p5';

export default function P5Canvas({ sketch }) {
  const containerRef = useRef();

  useEffect(() => {
    const p5Instance = new p5(sketch, containerRef.current);
    return () => p5Instance.remove();
  }, [sketch]);

  return <div ref={containerRef} />;
}