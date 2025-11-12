import { useXR } from "@react-three/xr";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * PlayerTracker com offsets relativos à direção da câmera.
 * Não move o jogador, apenas calcula e envia via onMove()
 * uma posição próxima (útil pra spawnar algo na frente, ao lado, etc.)
 *
 * @param {Function} onMove - Callback com a posição (THREE.Vector3)
 * @param {number} offsetX - deslocamento lateral (direita/esquerda)
 * @param {number} offsetY - deslocamento vertical (cima/baixo)
 * @param {number} offsetZ - deslocamento frontal/traseiro
 */
export function PlayerTracker({ onMove, offsetX = 0, offsetY = 0, offsetZ = 0 }) {
  const { player } = useXR();
  const { camera } = useThree();
  const lastPos = useRef(new THREE.Vector3());

  useFrame(() => {
    // Base: posição do jogador (XR) ou da câmera
    const base = player?.position || camera.position;

    // Direção que a câmera está olhando
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    // Vetor para o lado direito da câmera
    const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();

    // Calcula nova posição relativa
    const newPos = base.clone()
      .addScaledVector(right, offsetX) // direita/esquerda
      .addScaledVector(dir, offsetZ);  // frente/trás

    // Aplica deslocamento vertical
    newPos.y += offsetY;

    // Só envia se realmente mudou
    if (!lastPos.current.equals(newPos)) {
      lastPos.current.copy(newPos);
      onMove(newPos.clone());
    }
  });

  return null;
}
