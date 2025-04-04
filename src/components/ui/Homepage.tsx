import { useEffect, useRef, useState } from 'react';
import { SignInButton } from "@clerk/clerk-react";
import * as THREE from 'three';
import { dark } from '@clerk/themes';

interface Neuron {
  mesh: THREE.Mesh;
  originalY: number;
  pulsePhase: number;
  pulseSpeed: number;
}

const HomePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [titleText] = useState("Project Name");
  const [displayedTitle, setDisplayedTitle] = useState("");
 
  // Typewriter effect for title
  useEffect(() => {
    if (displayedTitle.length < titleText.length) {
      const timer = setTimeout(() => {
        setDisplayedTitle(titleText.substring(0, displayedTitle.length + 1));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [displayedTitle, titleText]);

  // Cursor trail effect
  useEffect(() => {
    if (!cursorRef.current) return;
    const trailCount = 12;
    const trailColors = [
      '#4f46e5', '#5e54e8', '#6d62eb', '#7c70ee', 
      '#8b7ef1', '#9a8cf4', '#a99af7', '#b8a8fa', 
      '#c7b6fd', '#d6c4ff', '#e5d2ff', '#f4e0ff'
    ];
    
    // Create cursor trails
    const trailsContainer = document.createElement('div');
    trailsContainer.className = 'fixed top-0 left-0 w-full h-full pointer-events-none z-50';
    document.body.appendChild(trailsContainer);
    
    // Create trail elements
    const trails: HTMLDivElement[] = [];
    for (let i = 0; i < trailCount; i++) {
      const trail = document.createElement('div');
      trail.className = 'absolute rounded-full pointer-events-none';
      trail.style.width = `${12 - i * 0.8}px`;
      trail.style.height = `${12 - i * 0.8}px`;
      trail.style.backgroundColor = trailColors[i] || '#4f46e5';
      trail.style.opacity = `${1 - i * 0.08}`;
      trail.style.zIndex = '9999';
      trail.style.filter = 'blur(1px)';
      trail.style.mixBlendMode = 'screen';
      trailsContainer.appendChild(trail);
      trails.push(trail);
    }
    
    trailsRef.current = trails;
    
    // Mouse move handler for trails
    const trailPositions: {x: number, y: number}[] = trails.map(() => ({x: 0, y: 0}));
    
    const handleMouseMove = (e: MouseEvent) => {
      trailPositions.unshift({x: e.clientX, y: e.clientY});
      trailPositions.pop();
      
      trails.forEach((trail, index) => {
        const position = trailPositions[index] || trailPositions[0];
        if (position) {
          trail.style.transform = `translate(${position.x - trail.offsetWidth/2}px, ${position.y - trail.offsetHeight/2}px)`;
        }
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeChild(trailsContainer);
    };
  }, []);

  // Three.js scene setup
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080818');
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x4f46e5, 1);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);
    
    // Create artistic handmade elements
    const createHandDrawnCircle = (radius: number, color: number, x: number, y: number, z: number) => {
      const group = new THREE.Group();
      const segments = 32;
      const points: THREE.Vector3[] = [];
      
      // Create a slightly irregular circle
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const variation = 1 + (Math.random() * 0.15 - 0.075);
        const xPos = Math.cos(theta) * radius * variation;
        const yPos = Math.sin(theta) * radius * variation;
        points.push(new THREE.Vector3(xPos, yPos, 0));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.7
      });
      
      const circle = new THREE.Line(geometry, material);
      group.add(circle);
      
      // Add some random crosshatch lines for texture
      for (let i = 0; i < 5; i++) {
        const linePoints = [];
        const start = Math.random() * Math.PI * 2;
        const length = radius * (0.5 + Math.random() * 0.5);
        
        linePoints.push(new THREE.Vector3(
          Math.cos(start) * radius * 0.7,
          Math.sin(start) * radius * 0.7,
          0
        ));
        
        linePoints.push(new THREE.Vector3(
          Math.cos(start) * radius * 0.7 + Math.random() * length - length/2,
          Math.sin(start) * radius * 0.7 + Math.random() * length - length/2,
          0
        ));
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        const line = new THREE.Line(lineGeometry, material);
        group.add(line);
      }
      
      // Set the group position
      group.position.set(x, y, z);
      
      // Add the group to the scene and return it
      scene.add(group);
      return group;
    };
    
    // Create neural network elements
    const neurons: Neuron[] = [];
    const neuronGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const neuronMaterial = new THREE.MeshPhongMaterial({
      color: 0x4f46e5,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.5,
    });
    
    // Create handdrawn elements
    const handDrawnElements: THREE.Group[] = [];
    for (let i = 0; i < 8; i++) {
      const radius = 0.3 + Math.random() * 0.7;
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 5 - 2;
      const color = new THREE.Color(0x4f46e5).getHex() + Math.floor(Math.random() * 0x222222);
      handDrawnElements.push(createHandDrawnCircle(radius, color, x, y, z));
    }
    
    // Create neurons at random positions
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 5 - 2;
      
      const neuron = new THREE.Mesh(neuronGeometry, neuronMaterial);
      neuron.position.set(x, y, z);
      scene.add(neuron);
      
      neurons.push({
        mesh: neuron,
        originalY: y,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 2
      });
    }
    
    // Create simple connections between neurons
    const connectionGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.2,
    });
    
    // Create connections
    const connectionPoints: THREE.Vector3[] = [];
    for (let i = 0; i < neurons.length; i += 2) {
      const neuron1 = neurons[i];
      const neuron2 = neurons[(i + 1) % neurons.length];
      connectionPoints.push(neuron1.mesh.position.clone());
      connectionPoints.push(neuron2.mesh.position.clone());
    }
    
    connectionGeometry.setFromPoints(connectionPoints);
    const connections = new THREE.LineSegments(connectionGeometry, lineMaterial);
    scene.add(connections);
    
    // Create particles for ambient effect (fewer particles for performance)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create a simple dot texture for particles
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(8, 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const particleTexture = new THREE.CanvasTexture(canvas);
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Mouse movement tracking
    const mouse = {
      x: 0,
      y: 0,
      target: {
        x: 0,
        y: 0
      }
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      mouse.target.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.target.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Handle window resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Smooth mouse tracking
      mouse.x += (mouse.target.x - mouse.x) * 0.05;
      mouse.y += (mouse.target.y - mouse.y) * 0.05;
      
      // Animate neurons
      const time = Date.now() * 0.001;
      neurons.forEach((neuron) => {
        const pulse = Math.sin(time * neuron.pulseSpeed + neuron.pulsePhase) * 0.5 + 0.5;
        neuron.mesh.position.y = neuron.originalY + Math.sin(time * 0.5) * 0.1;
        
        const material = neuron.mesh.material as THREE.MeshPhongMaterial;
        material.emissiveIntensity = 0.3 + pulse * 0.7;
        
        neuron.mesh.scale.set(
          1 + pulse * 0.3,
          1 + pulse * 0.3,
          1 + pulse * 0.3
        );
      });
      
      // Animate handdrawn elements
      handDrawnElements.forEach((elem, i) => {
        elem.rotation.z += 0.001 * (i % 2 === 0 ? 1 : -1);
        elem.position.y += Math.sin(time * 0.2 + i) * 0.001;
      });
      
      // Rotate particles slowly
      particlesMesh.rotation.x += 0.0003;
      particlesMesh.rotation.y += 0.0003;
      
      // Camera movement based on mouse
      camera.position.x += (mouse.x * 1 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.y * 1 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
      
      // Set loading to false after first render
      if (isLoading) {
        setIsLoading(false);
      }
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-900">
      <div ref={containerRef} className="absolute inset-0" />
      <div ref={cursorRef} className="hidden" />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-50">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Content overlay with hand-drawn style elements */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center max-w-2xl px-4 p-8 relative">
          {/* Hand-drawn decorative elements */}
          <svg className="absolute top-0 left-0 w-full h-full -z-10 opacity-30" viewBox="0 0 400 300">
            <path d="M20,50 Q50,20 80,50 T140,50 T200,50 T260,50 T320,50" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
            <path d="M20,250 Q50,280 80,250 T140,250 T200,250 T260,250 T320,250" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="200" cy="150" rx="180" ry="120" fill="none" stroke="#4f46e5" strokeWidth="3" strokeDasharray="10 5" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="#6366f1" strokeWidth="1" />
            <circle cx="350" cy="250" r="15" fill="none" stroke="#8b5cf6" strokeWidth="1" />
            <path d="M30,100 L50,140 L70,100 L90,140 L110,100" fill="none" stroke="#4f46e5" strokeWidth="1" strokeLinecap="round" />
            <path d="M290,200 L310,160 L330,200 L350,160 L370,200" fill="none" stroke="#6366f1" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <div className="mb-6 flex justify-center">
            <div className="relative w-48 h-1">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse filter blur-sm"></div>
            </div>
          </div>
          
          <h1 
            ref={titleRef} 
            className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 relative"
          >
            {displayedTitle}
            <span className="inline-block w-[2px] h-12 bg-indigo-500 ml-1 animate-blink"></span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-gray-300 leading-relaxed">
            Experience our next-generation AI platform with adaptive neural interfaces and quantum-inspired algorithms.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignInButton mode="modal" appearance={{ baseTheme: dark }}>
            {/* Your custom button as children */}
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto relative overflow-hidden group">
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
           </SignInButton>
            
            
          </div>
          <div className="mt-8 flex items-center justify-center gap-4 text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Anthony J. Ventura, Cedric Fan, Chen Yu Wang and Philip W. Ventura</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add some hand-drawn decorative elements */}
      <svg className="absolute bottom-4 left-4 w-32 h-32 opacity-30 z-10" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#4f46e5" strokeWidth="1" strokeDasharray="5 3" />
        <path d="M20,50 Q50,20 80,50" fill="none" stroke="#6366f1" strokeWidth="1" strokeLinecap="round" />
        <path d="M20,60 Q50,90 80,60" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeLinecap="round" />
        <circle cx="30" cy="30" r="5" fill="none" stroke="#4f46e5" strokeWidth="1" />
        <circle cx="70" cy="70" r="5" fill="none" stroke="#8b5cf6" strokeWidth="1" />
      </svg>
      
      <svg className="absolute top-4 left-4 w-32 h-32 opacity-30 z-10" viewBox="0 0 100 100">
        <path d="M10,50 L90,50 M50,10 L50,90" stroke="#4f46e5" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#6366f1" strokeWidth="1" />
        <path d="M30,30 L70,70 M30,70 L70,30" stroke="#8b5cf6" strokeWidth="1" strokeLinecap="round" />
      </svg>
      
      
    </div>
  );
};

export default HomePage;