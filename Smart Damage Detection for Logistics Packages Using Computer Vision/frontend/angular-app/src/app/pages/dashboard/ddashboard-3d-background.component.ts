import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-dashboard-3d-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-container">
      <canvas #canvas></canvas>
    </div>
  `,
  styles: [`
    .canvas-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      background: linear-gradient(135deg, #0a0e27 0%, #0f1419 50%, #0d1b2a 100%);
      pointer-events: none;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class Dashboard3DBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private packages: THREE.Mesh[] = [];
  private animationId: number = 0;

  ngOnInit() {
    this.initThree();
    this.createPackages();
    this.createParticles();
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
  }

  private initThree() {
    const canvas = this.canvasRef.nativeElement;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0e27, 10, 50);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;
    this.camera.position.y = 2;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // AI-themed Lights (Cyan/Teal/Green)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Cyan light (AI blue)
    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    // Green light (Matrix/tech green)
    const pointLight2 = new THREE.PointLight(0x00ff88, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    // Teal accent
    const pointLight3 = new THREE.PointLight(0x00e5ff, 1.5, 50);
    pointLight3.position.set(0, 5, -5);
    this.scene.add(pointLight3);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createPackages() {
    const packageCount = 12;

    for (let i = 0; i < packageCount; i++) {
      // Create package box with random size
      const width = Math.random() * 1.5 + 1;
      const height = Math.random() * 1.5 + 1;
      const depth = Math.random() * 1.5 + 1;

      const geometry = new THREE.BoxGeometry(width, height, depth);

      // Create glowing edges (AI cyan/green wireframe)
      const edges = new THREE.EdgesGeometry(geometry);
      const glowColor = Math.random() > 0.5 ? 0x00ffff : 0x00ff88;
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: glowColor,
        transparent: true,
        opacity: 0.8
      });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);

      // Main box material with AI colors
      const material = new THREE.MeshPhongMaterial({
        color: 0x0a1929,
        transparent: true,
        opacity: 0.2,
        shininess: 150,
        specular: 0x00ffff,
        emissive: glowColor,
        emissiveIntensity: 0.1
      });

      const packageBox = new THREE.Mesh(geometry, material);
      packageBox.add(wireframe);

      // Random position
      packageBox.position.x = (Math.random() - 0.5) * 30;
      packageBox.position.y = (Math.random() - 0.5) * 20;
      packageBox.position.z = (Math.random() - 0.5) * 30;

      // Random rotation
      packageBox.rotation.x = Math.random() * Math.PI;
      packageBox.rotation.y = Math.random() * Math.PI;
      packageBox.rotation.z = Math.random() * Math.PI;

      // Store random velocities for animation
      (packageBox as any).velocity = {
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.008,
        rotationX: (Math.random() - 0.5) * 0.015,
        rotationY: (Math.random() - 0.5) * 0.015,
        rotationZ: (Math.random() - 0.5) * 0.015
      };

      this.packages.push(packageBox);
      this.scene.add(packageBox);
    }
  }

  private createParticles() {
    // Add floating particles for AI effect
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      // AI colors (cyan/green/white)
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0; // R
        colors[i * 3 + 1] = 1; // G (cyan)
        colors[i * 3 + 2] = 1; // B
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 1; // Green
        colors[i * 3 + 2] = 0.5;
      } else {
        colors[i * 3] = 1; // White
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      }
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Animate each package
    this.packages.forEach(packageBox => {
      const velocity = (packageBox as any).velocity;

      // Rotate
      packageBox.rotation.x += velocity.rotationX;
      packageBox.rotation.y += velocity.rotationY;
      packageBox.rotation.z += velocity.rotationZ;

      // Move
      packageBox.position.x += velocity.x;
      packageBox.position.y += velocity.y;
      packageBox.position.z += velocity.z;

      // Boundary check - wrap around
      if (packageBox.position.x > 15) packageBox.position.x = -15;
      if (packageBox.position.x < -15) packageBox.position.x = 15;
      if (packageBox.position.y > 10) packageBox.position.y = -10;
      if (packageBox.position.y < -10) packageBox.position.y = 10;
      if (packageBox.position.z > 15) packageBox.position.z = -15;
      if (packageBox.position.z < -15) packageBox.position.z = 15;
    });

    // Slight camera movement for depth
    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
    this.camera.position.y = Math.cos(Date.now() * 0.0001) * 2 + 2;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}