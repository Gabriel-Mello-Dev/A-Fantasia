import React, { useRef, useState, useRef as useRefHook, useEffect } from "react";
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
  const [isHovered, setIsHovered] = useState(false); // 👈 novo
const [pos, setPos] = useState(() => {
  if (Array.isArray(position)) {
    return new THREE.Vector3(...position);
  } else if (position instanceof THREE.Vector3) {
    return position.clone();
  } else {
    return new THREE.Vector3(0, 0, 0);
  }
});
  const [dragPlane, setDragPlane] = useState(null);
  const [offset, setOffset] = useState(new THREE.Vector3());

  // triple click
  const clickCountRef = useRefHook(0);
  const lastClickTimeRef = useRefHook(0);
  const CLICK_WINDOW_MS = 500;

  const texture = textureUrl ? useTexture(textureUrl) : null;

  // 🔄 movimento suave
  useFrame(() => {
    if (ref.current) {
      ref.current.position.lerp(pos, 0.08);
    }
  });

  // 🖱️ Scroll move o token se ele estiver selecionado ou com hover
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isHovered && !isDragging) return; // 👈 só o token sob o mouse se move

      e.stopPropagation();
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);

      const distance = e.deltaY * -0.002;
      setPos((prev) => prev.clone().addScaledVector(dir, distance));
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [camera, isHovered, isDragging]);

  // 🖱️ Clique e arrasto
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

    // triple click
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

  // 👇 eventos de hover
  const onPointerEnter = (e) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = "grab";
  };

  const onPointerLeave = (e) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = "default";
  };

  return (
    <mesh
      ref={ref}
      position={pos}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1.5, 3]} />
      {texture ? (
        <meshStandardMaterial map={texture} transparent />
      ) : (
        <meshStandardMaterial color={isHovered ? "gold" : "orange"} />
      )}
    </mesh>
  );
}

export { DraggableToken };
