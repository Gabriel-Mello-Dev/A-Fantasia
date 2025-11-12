import React from "react";
import { Html, useTexture } from "@react-three/drei";

function SpawnerBox({ position, textureUrl, label, type, addToken }) {
  // 🖼️ Carrega a textura da imagem
  const texture = useTexture(textureUrl);

  return (
    <mesh
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        const { x, z } = e.point;
        addToken([x, 0, z], type);
      }}
    >
      {/* 🎨 Box com textura */}
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial map={texture} />

  
    </mesh>
  );
}

export { SpawnerBox };
