import { useEffect, useRef } from 'react';

export default function SPHCanvas({ particles, width = 1024, height = 768 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f5f0e6';
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.pos[0], p.pos[1], 4, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    const frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [particles, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="w-full h-auto border" />;
}