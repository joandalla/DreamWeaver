import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas({ particles }) {
  const containerRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const pointsRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.OrthographicCamera(0, 600, 400, 0, 0.1, 1000);
    camera.position.z = 1;
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(600, 400);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({ size: 5, vertexColors: true });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    return () => renderer.dispose();
  }, []);

  useEffect(() => {
    if (!particles || !pointsRef.current) return;
    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 3);
    particles.forEach((p, i) => {
      positions[i*3] = p.pos[0];
      positions[i*3+1] = p.pos[1];
      positions[i*3+2] = 0;
      // Farbe von Hex zu RGB
      const hex = p.color;
      const r = parseInt(hex.slice(1,3), 16)/255;
      const g = parseInt(hex.slice(3,5), 16)/255;
      const b = parseInt(hex.slice(5,7), 16)/255;
      colors[i*3] = r;
      colors[i*3+1] = g;
      colors[i*3+2] = b;
    });
    pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pointsRef.current.geometry.setDrawRange(0, particles.length);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [particles]);

  return <div ref={containerRef} />;
}