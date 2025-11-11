import React, { useRef, useState, useRef as useRefHook } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function DraggableToken({
  position = [0, 0, 0],
  textureUrl,
  label = "Token",
  onDelete,
}) {
  const ref = useRef();
  const { camera, raycaster, mouse } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState(new THREE.Vector3(...position));
  const [dragPlane, setDragPlane] = useState(null);
  const [offset, setOffset] = useState(new THREE.Vector3());

  // triple click
  const clickCountRef = useRefHook(0);
  const lastClickTimeRef = useRefHook(0);
  const CLICK_WINDOW_MS = 500;

  const texture = textureUrl ? useTexture(textureUrl) : null;

  useFrame(() => {
    if (ref.current) {
    ref.current.position.lerp(pos, 0.08);
    }
  });

  const onPointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);

    // plano invisível de arrasto (alinhado à câmera)
    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      normal,
      ref.current.position
    );
    setDragPlane(plane);

    // salva o offset do clique dentro do objeto
    const intersection = new THREE.Vector3();
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersection);
    setOffset(intersection.clone().sub(ref.current.position));

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

  return (
    <mesh
      ref={ref}
      position={pos}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1.5, 3]} />
      {texture ? (
        <meshStandardMaterial map={texture} transparent />
      ) : (
        <meshStandardMaterial color="orange" />
      )}
    </mesh>
  );
}

export { DraggableToken };
