import React, {
  useRef,
  useState,
  useRef as useRefHook,
  useEffect,
  useCallback,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function DraggableGLBToken({
  position = [0, 0, 0],
  modelUrl,
  label = "GLB Token",
  onDelete,
  onMove, // 👈 para salvar posição
  scale = 1,
}) {
  const ref = useRef();
  const { scene } = useGLTF(modelUrl);
  const { camera, raycaster, mouse } = useThree();

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pos, setPos] = useState(new THREE.Vector3(...position));
  const [dragPlane, setDragPlane] = useState(null);
  const [offset, setOffset] = useState(new THREE.Vector3());

  // triple click
  const clickCountRef = useRefHook(0);
  const lastClickTimeRef = useRefHook(0);
  const CLICK_WINDOW_MS = 500;

  // Suaviza o movimento
  useFrame(() => {
    if (ref.current) {
      ref.current.position.lerp(pos, 0.08);
    }
  });

  // Scroll move o token pra frente/trás
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isHovered && !isDragging) return;
      e.stopPropagation();
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const distance = e.deltaY * -0.002;
      setPos((prev) => prev.clone().addScaledVector(dir, distance));
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [camera, isHovered, isDragging]);

  // Clique e arrasto
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
    if (onMove) onMove(pos.toArray()); // ✅ salva posição final
  };

  const onPointerMove = (e) => {
    if (isDragging && dragPlane) {
      raycaster.setFromCamera(mouse, camera);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        const newPos = intersection.sub(offset);
        setPos(newPos);
        if (onMove) onMove(newPos.toArray()); // opcional: atualiza em tempo real
      }
    }
  };

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
    <primitive
      ref={ref}
      object={scene.clone(true)}
      position={pos}
      scale={scale}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    />
  );
}

export { DraggableGLBToken };
