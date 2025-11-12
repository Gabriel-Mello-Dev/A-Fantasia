// useGroundY.js
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCallback } from "react";

export function useGroundY() {
  const { scene } = useThree();
  const raycaster = new THREE.Raycaster();

  const getGroundY = useCallback((x, z, maxDistance = 50) => {
    // começa um pouco acima do jogador (evita começar dentro do chão)
    const origin = new THREE.Vector3(x, 100, z); // 100m acima
    const dir = new THREE.Vector3(0, -1, 0);
    raycaster.set(origin, dir);
    // intersectObjects espera uma array; true faz pesquisar nos filhos recursivamente
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      // retorna Y do primeiro hit (mais perto)
      return intersects[0].point.y;
    }
    // se não achou nada, fallback (por exemplo, retorno 0)
    return null;
  }, [scene]);

  return getGroundY;
}
