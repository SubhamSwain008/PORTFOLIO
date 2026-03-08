"use client";

import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

interface InstancedGrassSmallProps {
    realm: "night" | "day";
    baseColor: string;
    count: number;
}

// Pseudo-random deterministic generator
function prng(seed: number) {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export default function InstancedGrassSmall({ realm, baseColor, count }: InstancedGrassSmallProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null!);

    const seedOffset = realm === "day" ? 50000 : 30000;

    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
        vertexColors: true,
        side: THREE.DoubleSide,
    }), [baseColor]);

    // Tiny cross-blade geometry — same shape as InstancedGrass but ~7x smaller
    const geometry = useMemo(() => {
        const segsX = 1;
        const segsY = 3; // fewer segments since it's tiny
        const width = 0.04;  // ~7x smaller than 0.25
        const height = 0.13; // ~7x smaller than 0.9

        const plane1 = new THREE.PlaneGeometry(width, height, segsX, segsY);
        const plane2 = new THREE.PlaneGeometry(width, height, segsX, segsY);
        plane2.rotateY(Math.PI / 2);

        const merged = new THREE.BufferGeometry();
        const p1Pos = plane1.attributes.position;
        const p2Pos = plane2.attributes.position;
        const totalVerts = p1Pos.count + p2Pos.count;

        const positions = new Float32Array(totalVerts * 3);
        for (let i = 0; i < p1Pos.count; i++) {
            positions[i * 3] = p1Pos.getX(i);
            positions[i * 3 + 1] = p1Pos.getY(i);
            positions[i * 3 + 2] = p1Pos.getZ(i);
        }
        for (let i = 0; i < p2Pos.count; i++) {
            const idx = p1Pos.count + i;
            positions[idx * 3] = p2Pos.getX(i);
            positions[idx * 3 + 1] = p2Pos.getY(i);
            positions[idx * 3 + 2] = p2Pos.getZ(i);
        }

        const idx1 = plane1.index!;
        const idx2 = plane2.index!;
        const indices = new Uint16Array(idx1.count + idx2.count);
        for (let i = 0; i < idx1.count; i++) indices[i] = idx1.getX(i);
        for (let i = 0; i < idx2.count; i++) indices[idx1.count + i] = idx2.getX(i) + p1Pos.count;

        merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        merged.setIndex(new THREE.BufferAttribute(indices, 1));
        merged.translate(0, height / 2, 0);

        // Taper
        const pos = merged.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const t = y / height;
            const taper = 1.0 - t * t * 0.85;
            pos.setX(i, pos.getX(i) * taper);
            pos.setZ(i, pos.getZ(i) * taper);
        }
        pos.needsUpdate = true;
        merged.computeVertexNormals();

        plane1.dispose();
        plane2.dispose();
        return merged;
    }, []);

    useEffect(() => {
        if (!meshRef.current) return;

        const colorArr = new Float32Array(count * 3);
        const baseC = new THREE.Color(baseColor);

        for (let i = 0; i < count; i++) {
            const seed = i + seedOffset;

            // Dense, even spread across entire 300x300 area
            const px = (prng(seed) - 0.5) * 300;
            const pz = (prng(seed + 100000) - 0.5) * 300;

            // Skip building area
            if (px * px + pz * pz < 50) {
                tempObject.position.set(0, -1000, 0);
                tempObject.scale.set(0, 0, 0);
                tempObject.updateMatrix();
                meshRef.current.setMatrixAt(i, tempObject.matrix);
                tempColor.setRGB(0, 0, 0);
                tempColor.toArray(colorArr, i * 3);
                continue;
            }

            const rotY = prng(seed + 200000) * Math.PI * 2;
            const scaleY = 0.6 + prng(seed + 300000) * 0.8;
            const scaleX = 0.5 + prng(seed + 400000) * 0.8;

            tempObject.position.set(px, 0, pz);
            tempObject.rotation.set(0, rotY, 0);
            tempObject.scale.set(scaleX, scaleY, 1);
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);

            tempColor.copy(baseC).offsetHSL(
                (prng(seed + 500000) - 0.5) * 0.05,
                (prng(seed + 600000) - 0.5) * 0.08,
                (prng(seed + 700000) - 0.5) * 0.05
            );
            tempColor.toArray(colorArr, i * 3);
        }

        meshRef.current.geometry.setAttribute(
            "color",
            new THREE.InstancedBufferAttribute(colorArr, 3)
        );
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [realm, count, seedOffset, baseColor]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, count]}
            frustumCulled={false}
            receiveShadow
        />
    );
}
