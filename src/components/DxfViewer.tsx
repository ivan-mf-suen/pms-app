'use client';

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { DXFLoader } from 'three-dxf-loader';

interface DxfViewerProps {
  url: string;
  width?: string | number;
  height?: string | number;
}

// Inner component that loads the DXF model
function DxfModel({ url }: { url: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, camera } = useThree();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loader = new DXFLoader();
    
    // Configure loader
    loader.setEnableLayer(true);
    loader.setConsumeUnits(true);
    loader.setDefaultColor(0x111111);

    loader.load(
      url,
      (data) => {
        if (groupRef.current) {
          // Clear existing children
          while (groupRef.current.children.length > 0) {
            groupRef.current.remove(groupRef.current.children[0]);
          }

          // Add the loaded entity to the group
          if (data.entity) {
            groupRef.current.add(data.entity);

            // Auto-fit camera to model
            const box = new THREE.Box3().setFromObject(data.entity);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 75;
            let cameraZ = Math.abs((maxDim / 2) / Math.tan((fov * Math.PI) / 360));

            cameraZ *= 1.5; // Zoom out a bit

            camera.position.z = cameraZ;
            camera.lookAt(box.getCenter(new THREE.Vector3()));

            // Set near and far planes
            camera.near = maxDim / 100;
            camera.far = maxDim * 100;
            camera.updateProjectionMatrix();
          }

          setLoaded(true);
          setError(null);
        }
      },
      (progress) => {
        // Handle progress if needed
        console.log('DXF loading progress:', (progress.loaded / progress.total) * 100 + '%');
      },
      (error) => {
        console.error('Error loading DXF:', error);
        setError('Failed to load DXF file. Make sure the file format is supported.');
        setLoaded(true);
      }
    );

    return () => {
      // Cleanup if needed
    };
  }, [url, camera]);

  if (error) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 10, 10]} />
        <meshBasicMaterial color={0xff0000} wireframe />
      </mesh>
    );
  }

  return <group ref={groupRef} />;
}

// Loader fallback UI
function LoaderFallback() {
  return (
    <mesh position={[0, 0, -5]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={0x888888} />
    </mesh>
  );
}

// Main DXF Viewer component
export default function DxfViewer({
  url,
  width = '100%',
  height = '700px',
}: DxfViewerProps) {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}
      >
        <p className="text-gray-500">Loading viewer...</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}
      >
        <p className="text-gray-500">No DXF file specified</p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #ddd',
        backgroundColor: '#ffffff',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 100], near: 0.1, far: 100000  }}
        style={{ width: '100%', height: '100%' }}
        onCreated={(state) => {
          state.gl.setClearColor(0xf5f5f5);
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Camera */}

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={false}
          autoRotate={false}
        />

        {/* Model */}
        <Suspense fallback={<LoaderFallback />}>
          <DxfModel url={url} />
        </Suspense>

      </Canvas>
    </div>
  );
}
