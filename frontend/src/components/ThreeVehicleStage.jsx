import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeVehicleStage
 * High-performance 3D ambient particle constellation and rotating holographic
 * showroom pedestal powered by Three.js. Includes mouse-tracking interactive lighting.
 */
export default function ThreeVehicleStage({
  accentColor = '#FF5500',
  secondaryColor = '#FFFFFF',
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene, Camera, Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch (err) {
      console.warn('WebGL is not supported or context could not be created:', err);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 11);
    camera.lookAt(0, 0, 0);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dynamic Colors for Livery Combination
    const colorPrimary = new THREE.Color(accentColor);
    const colorSecondary = new THREE.Color(secondaryColor);

    // 1. Particle Cloud Constellation (Dual-Tone)
    const particleCount = 280;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.3) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;

      // 70% primary color, 30% secondary color for rich contrasting particle field
      const pickColor = Math.random() > 0.3 ? colorPrimary : colorSecondary;
      colors[i * 3] = pickColor.r;
      colors[i * 3 + 1] = pickColor.g;
      colors[i * 3 + 2] = pickColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 2. Holographic Ring Pedestal Floor
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, -1.8, 0);
    ringGroup.rotation.x = Math.PI / 2;

    const outerRingGeo = new THREE.RingGeometry(3.6, 3.65, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorPrimary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
    ringGroup.add(outerRing);

    const innerRingGeo = new THREE.RingGeometry(2.4, 2.44, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: colorSecondary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    ringGroup.add(innerRing);

    // Radial Spokes in contrasting color
    const spokeCount = 16;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const spokeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0),
        new THREE.Vector3(Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 0),
      ]);
      const spokeMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? colorPrimary : colorSecondary,
        transparent: true,
        opacity: 0.25,
      });
      const spoke = new THREE.Line(spokeGeo, spokeMat);
      ringGroup.add(spoke);
    }

    scene.add(ringGroup);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const spotLight = new THREE.PointLight(colorPrimary, 3, 20);
    spotLight.position.set(0, 4, 3);
    scene.add(spotLight);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 1.5;
      camera.position.y = 3 + targetY * 0.8;
      camera.lookAt(0, 0, 0);

      // Rotate particles and rings
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.08;

      ringGroup.rotation.z = -elapsedTime * 0.12;

      // Pulse spotlight
      spotLight.intensity = 2.5 + Math.sin(elapsedTime * 2.5) * 0.8;
      spotLight.position.x = Math.sin(elapsedTime) * 3;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      try {
        if (container && renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        particleGeometry?.dispose();
        particleMaterial?.dispose();
        outerRingGeo?.dispose();
        ringMat?.dispose();
        innerRingGeo?.dispose();
        innerRingMat?.dispose();
        renderer?.dispose();
      } catch (_e) {
        // Safe disposal fallback
      }
    };
  }, [accentColor, secondaryColor]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      style={{ filter: 'drop-shadow(0 0 40px rgba(16, 185, 129, 0.15))' }}
    />
  );
}
