'use client';

import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const COLORS = [
    0x00ff00,
    0xff0000,
    0x0000ff,
    0xffff00,
    0xff00ff,
    0x00ffff,
    0xffffff,
    0xff8800,
];

const BOUNDS = 15;
const TUBE_RADIUS = 0.6;
const SPHERE_RADIUS = 0.7;
const SPEED = 15;
const MAX_PIPES = 1000;

function Pipes() {
    const { scene } = useThree();

    const state = useRef({
        pipes: [] as THREE.Mesh[],
        currentPos: new THREE.Vector3(),
        currentDir: new THREE.Vector3(),
        currentColor: COLORS[0],
        lastTurnPos: new THREE.Vector3(),
        tempCylinder: null as THREE.Mesh | null,
    });

    const materials = useRef<{ [key: number]: THREE.MeshPhongMaterial }>({});
    const geometries = useRef({
        sphere: new THREE.SphereGeometry(SPHERE_RADIUS, 16, 16),
        cylinder: new THREE.CylinderGeometry(TUBE_RADIUS, TUBE_RADIUS, 1, 16)
    });

    useEffect(() => {
        // Iniciar materiales
        COLORS.forEach(c => {
            materials.current[c] = new THREE.MeshPhongMaterial({
                color: c,
                shininess: 100,
                specular: 0x444444
            });
        });

        resetPipe();

        return () => {
            // Limpiar memoria
            state.current.pipes.forEach(p => scene.remove(p));
            if (state.current.tempCylinder) scene.remove(state.current.tempCylinder);
            Object.values(materials.current).forEach(m => m.dispose());
            geometries.current.sphere.dispose();
            geometries.current.cylinder.dispose();
        };
    }, []);

    const resetPipe = () => {
        if (state.current.tempCylinder) {
            scene.remove(state.current.tempCylinder);
            state.current.tempCylinder = null;
        }

        // Comprobar límite y limpiar
        if (state.current.pipes.length > MAX_PIPES) {
            state.current.pipes.forEach(p => scene.remove(p));
            state.current.pipes = [];
        }

        const startX = Math.round(Math.random() * BOUNDS * 2 - BOUNDS);
        const startY = Math.round(Math.random() * BOUNDS * 2 - BOUNDS);
        const startZ = Math.round(Math.random() * BOUNDS * 2 - BOUNDS);

        state.current.currentPos.set(startX, startY, startZ);
        state.current.lastTurnPos.copy(state.current.currentPos);
        state.current.currentColor = COLORS[Math.floor(Math.random() * COLORS.length)];

        const dirs = [
            new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)
        ];
        state.current.currentDir = dirs[Math.floor(Math.random() * dirs.length)];

        addSphere(state.current.currentPos, state.current.currentColor);
    };

    const addSphere = (pos: THREE.Vector3, color: number) => {
        const mesh = new THREE.Mesh(geometries.current.sphere, materials.current[color]);
        mesh.position.copy(pos);
        scene.add(mesh);
        state.current.pipes.push(mesh);
    };

    const getAxisRotation = (dir: THREE.Vector3) => {
        if (Math.abs(dir.x) > 0) return new THREE.Euler(0, 0, Math.PI / 2);
        if (Math.abs(dir.z) > 0) return new THREE.Euler(Math.PI / 2, 0, 0);
        return new THREE.Euler(0, 0, 0);
    };

    const createCylinder = (p1: THREE.Vector3, p2: THREE.Vector3, dir: THREE.Vector3, color: number) => {
        const mesh = new THREE.Mesh(geometries.current.cylinder, materials.current[color]);
        updateCylinder(mesh, p1, p2, dir);
        scene.add(mesh);
        return mesh;
    };

    const updateCylinder = (mesh: THREE.Mesh, p1: THREE.Vector3, p2: THREE.Vector3, dir: THREE.Vector3) => {
        const length = p1.distanceTo(p2);
        mesh.scale.set(1, Math.max(0.01, length), 1);
        mesh.position.copy(p1).lerp(p2, 0.5);
        mesh.setRotationFromEuler(getAxisRotation(dir));
    };

    useFrame((_, delta) => {
        const safeDelta = Math.min(delta, 0.1);
        const advance = state.current.currentDir.clone().multiplyScalar(SPEED * safeDelta);
        const nextPos = state.current.currentPos.clone().add(advance);

        const outOfBounds = Math.abs(nextPos.x) > BOUNDS || Math.abs(nextPos.y) > BOUNDS || Math.abs(nextPos.z) > BOUNDS;

        const currentRounded = state.current.currentPos.clone().round();
        const nextRounded = nextPos.clone().round();
        const crossedGrid = !currentRounded.equals(nextRounded);

        if (outOfBounds || (crossedGrid && Math.random() > 0.85)) {
            nextPos.copy(nextRounded);

            if (state.current.tempCylinder) {
                updateCylinder(state.current.tempCylinder, state.current.lastTurnPos, nextPos, state.current.currentDir);
                state.current.pipes.push(state.current.tempCylinder);
                state.current.tempCylinder = null;
            } else {
                addSphere(state.current.lastTurnPos, state.current.currentColor);
                const mesh = createCylinder(state.current.lastTurnPos, nextPos, state.current.currentDir, state.current.currentColor);
                state.current.pipes.push(mesh);
            }

            addSphere(nextPos, state.current.currentColor);

            state.current.lastTurnPos.copy(nextPos);
            state.current.currentPos.copy(nextPos);

            if (outOfBounds) {
                resetPipe();
            } else {
                const dirs = [
                    new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
                    new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
                    new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)
                ];
                const validDirs = dirs.filter(d => Math.abs(d.dot(state.current.currentDir)) < 0.1);
                state.current.currentDir = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
        } else {
            state.current.currentPos.copy(nextPos);
            if (!state.current.tempCylinder) {
                state.current.tempCylinder = createCylinder(state.current.lastTurnPos, nextPos, state.current.currentDir, state.current.currentColor);
            } else {
                updateCylinder(state.current.tempCylinder, state.current.lastTurnPos, state.current.currentPos, state.current.currentDir);
            }
        }
    });

    return null;
}

function CameraRig() {
    useFrame((state) => {
        // Rotar lentamente la cámara alrededor de la escena
        const time = state.clock.getElapsedTime();
        const radius = 35;
        state.camera.position.x = Math.sin(time * 0.2) * radius;
        state.camera.position.z = Math.cos(time * 0.2) * radius;
        state.camera.position.y = Math.sin(time * 0.1) * 10;
        state.camera.lookAt(0, 0, 0);
    });
    return null;
}

export default function Screensaver({ onActivity }: { onActivity: () => void }) {
    useEffect(() => {
        let isActive = true;

        const handleActivity = () => {
            if (isActive) onActivity();
        };

        const timerId = setTimeout(() => {
            if (!isActive) return;
            window.addEventListener('mousemove', handleActivity);
            window.addEventListener('keydown', handleActivity);
            window.addEventListener('click', handleActivity);
            window.addEventListener('touchstart', handleActivity);
        }, 500);

        return () => {
            isActive = false;
            clearTimeout(timerId);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
        };
    }, [onActivity]);

    return (
        <div className="fixed inset-0 z-[99999] bg-black overflow-hidden cursor-none">
            <Canvas camera={{ position: [0, 0, 35], fov: 60 }}>
                <color attach="background" args={['black']} />
                <ambientLight intensity={1.5} />
                <directionalLight position={[20, 20, 20]} intensity={2} />
                <directionalLight position={[-20, -20, -20]} intensity={1} />
                <directionalLight position={[0, 20, -20]} intensity={1.5} />

                <Pipes />
                <CameraRig />
            </Canvas>

            <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none select-none z-10">
                <span className="text-gray-500/50 text-sm font-sans tracking-widest uppercase">
                    Mueve el mouse para salir
                </span>
            </div>
        </div>
    );
}
