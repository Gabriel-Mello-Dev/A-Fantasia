import React, { useRef, useState, useEffect, useRef as useRefHook } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Model3D({ position = [0, 0, 0], modelUrl, onDelete }) {
  if (!modelUrl) return null; // evita erro

  const ref = useRef();
  const gltf = useGLTF(modelUrl);
  const { camera, raycaster, mouse } = useThree();

  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState(new THREE.Vector3(...position));
  const [dragPlane, setDragPlane] = useState(null);
  const [offset, setOffset] = useState(new THREE.Vector3());
  const [hovered, setHovered] = useState(false);

  // triple click
  const clickCountRef = useRefHook(0);
  const lastClickTimeRef = useRefHook(0);
  const CLICK_WINDOW_MS = 500;

  // 🔧 Desabilita eventos em submeshes (para não travar)
  useEffect(() => {
    if (!gltf?.scene) return;
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // impede que submeshes acionem eventos múltiplos
        child.onPointerOver = (e) => e.stopPropagation();
        child.onPointerOut = (e) => e.stopPropagation();
      }
    });
  }, [gltf]);

  // movimento suave
  useFrame(() => {
    if (ref.current) ref.current.position.lerp(pos, 0.12);
  });

  // scroll move pra frente/trás
  useEffect(() => {
    const handleWheel = (e) => {
      if (!hovered && !isDragging) return;
      e.stopPropagation();
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const distance = e.deltaY * -0.002;
      setPos((prev) => prev.clone().addScaledVector(dir, distance));
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [camera, hovered, isDragging]);

  // clique e arrasto
  const onPointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);

    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      normal,
      ref.current.position
    );
    setDragPlane(plane);

    const intersection = new THREE.Vector3();
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersection);
    setOffset(intersection.clone().sub(ref.current.position));

    // 3 cliques para excluir
    const now = performance.now();
    if (now - lastClickTimeRef.current <= CLICK_WINDOW_MS) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      if (onDelete) onDelete();
    }
  };

  const onPointerUp = (e) => {
    e.stopPropagation();
    setIsDragging(false);
    setDragPlane(null);
  };

  const onPointerMove = () => {
    if (isDragging && dragPlane) {
      raycaster.setFromCamera(mouse, camera);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        const newPos = intersection.sub(offset);
        setPos(newPos);
      }
    }
  };

  const onPointerEnter = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "grab";
  };

  const onPointerLeave = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "default";
  };

  return (
    <primitive
      ref={ref}
      object={gltf.scene.clone()}
      position={pos}
      scale={1.5}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    />
  );
}

export { Model3D };
