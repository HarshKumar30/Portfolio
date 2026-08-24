import * as THREE from 'three';

const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const resize = () => {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  const group = new THREE.Group();
  scene.add(group);

  const geo = new THREE.IcosahedronGeometry(1.4, 1);
  const wire = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    })
  );
  group.add(wire);

  const innerGeo = new THREE.IcosahedronGeometry(0.85, 2);
  const innerWire = new THREE.Mesh(
    innerGeo,
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    })
  );
  group.add(innerWire);

  const ringGeo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
  const ring = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.35,
    })
  );
  ring.rotation.x = Math.PI / 2.2;
  group.add(ring);

  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 14;
    positions[i + 1] = (Math.random() - 0.5) * 14;
    positions[i + 2] = (Math.random() - 0.5) * 14;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.03,
      transparent: true,
      opacity: 0.5,
    })
  );
  scene.add(particles);

  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const clock = new THREE.Clock();

  const animate = () => {
    const t = clock.getElapsedTime();
    wire.rotation.x = t * 0.25;
    wire.rotation.y = t * 0.35;
    innerWire.rotation.x = -t * 0.35;
    innerWire.rotation.y = -t * 0.25;
    ring.rotation.z = t * 0.15;
    ring.rotation.x = Math.PI / 2.2 + Math.sin(t * 0.4) * 0.15;
    particles.rotation.y = t * 0.03;
    group.rotation.x += (mouse.y * 0.15 - group.rotation.x) * 0.05;
    group.rotation.y += (mouse.x * 0.25 - group.rotation.y) * 0.05;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();

  window.addEventListener('beforeunload', () => {
    geo.dispose();
    innerGeo.dispose();
    ringGeo.dispose();
    particlesGeo.dispose();
    wire.material.dispose();
    innerWire.material.dispose();
    ring.material.dispose();
    particles.material.dispose();
    renderer.dispose();
  });
}
