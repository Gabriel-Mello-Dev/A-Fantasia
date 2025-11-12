import { useXR } from "@react-three/xr";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";

/**
 * PlayerTracker com offsets relativos à direção da câmera.
 * Pode ser pausado via ref (para hover, menus, etc.)
 *
 * @param {Function} onMove - Callback com a posição (THREE.Vector3)
 * @param {number} offsetX - deslocamento lateral (direita/esquerda)
 * @param {number} offsetY - deslocamento vertical (cima/baixo)
 * @param {number} offsetZ - deslocamento frontal/traseiro
 */
export const PlayerTracker = forwardRef(function PlayerTracker(
  { onMove, offsetX = 0, offsetY = 0, offsetZ = 0 },
  ref
) {
  const { player } = useXR();
  const { camera } = useThree();
  const lastPos = useRef(new THREE.Vector3());
  const isPaused = useRef(false);

  // Permite controle externo
  useImperativeHandle(ref, () => ({
    pause: () => (isPaused.current = true),
    resume: () => (isPaused.current = false),
  }));

  useFrame(() => {
    if (isPaused.current) return; // 🚫 Pausado — não atualiza

    const base = player?.position || camera.position;

    // Direção que a câmera está olhando
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    // Vetor lateral direito
    const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();

    // Calcula nova posição
    const newPos = base
      .clone()
      .addScaledVector(right, offsetX)
      .addScaledVector(dir, offsetZ);
    newPos.y += offsetY;

    // Atualiza só se mudou
    if (!lastPos.current.equals(newPos)) {
      lastPos.current.copy(newPos);
      onMove(newPos.clone());
    }
  });

  return null;
});
