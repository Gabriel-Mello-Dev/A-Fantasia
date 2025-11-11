import { useXR } from "@react-three/xr";
import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";

function FloatingMenu({ addToken }) {
  const { player } = useXR(); // pega posição/rotação do jogador (XR ou não)
  const groupRef = useRef();

  useFrame(() => {
    if (player && groupRef.current) {
      // Pega posição e rotação do jogador
      const pos = player.position;
      const rot = player.rotation;

      // Faz o grupo seguir o jogador
      groupRef.current.position.copy(pos);

      // Mantém o menu sempre à frente do jogador
      const offset = new THREE.Vector3(0, 1.5, -1.5); // 1.5m à frente, 1.5m de altura
      offset.applyEuler(rot);
      groupRef.current.position.add(offset);

      // Faz o menu sempre "olhar" para o jogador
      groupRef.current.lookAt(pos.x, pos.y + 1.5, pos.z);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Box padrão */}
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          const { x, z } = e.point;
          addToken([x, 0, z]);
        }}
        position={[-0.4, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Box "Orc" */}
      <mesh
        position={[0.4, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          const { x, z } = e.point;
          addToken([x, 0, z], "orc");
        }}
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#5ae000" />
      </mesh>
    </group>
  );
}

export  {FloatingMenu};
