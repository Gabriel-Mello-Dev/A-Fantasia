import React, { useRef, useState, useRef as useRefHook } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function DraggableToken({
  position = [0, 0, 0],
  textureUrl,
  label = "Token",
  onDelete, // <- nova prop
}) {
  const ref = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState(position);

  // clique consecutivo (triple click)
  const clickCountRef = useRefHook(0);
  const lastClickTimeRef = useRefHook(0);
  const CLICK_WINDOW_MS = 500; // janela de tempo entre cliques

  const texture = textureUrl ? useTexture(textureUrl) : null;

  useFrame(() => {
    if (ref.current) {
      ref.current.position.lerp(new THREE.Vector3(...pos), 0.2);
    }
  });

  const onPointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);

    // lógica de triple click
    const now = performance.now();
    if (now - lastClickTimeRef.current <= CLICK_WINDOW_MS) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      // dispara exclusão se fornecido
      if (onDelete) onDelete();
    }
  };

  const onPointerUp = (e) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  const onPointerMove = (e) => {
    if (isDragging) {
      const point = e.point;
      setPos([point.x, 0, point.z]);
    }
  };

  return (
    <mesh
      ref={ref}
      position={pos}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    >
      <planeGeometry args={[1.5, 3]} />
      {texture ? (
        <meshBasicMaterial map={texture} transparent />
      ) : (
        <meshStandardMaterial color="orange" />
      )}
    </mesh>
  );
}

export { DraggableToken };