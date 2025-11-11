import React, { Suspense } from "react";
import { useGLTF, Html } from "@react-three/drei";

function ModelContent({ url }) {
  console.log("[Model3D] Tentando carregar:", url);
  const gltf = useGLTF(url); // <-- O Suspense cuida do carregamento
  console.log("[Model3D] Modelo carregado com sucesso:", gltf);

  return (
    <primitive
      object={gltf.scene}
      scale={0.5}
      position={[0, -1, -3]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
}

export function Model3D({ url }) {
  if (!url) {
    console.error("[Model3D] Nenhum URL foi fornecido");
    return (
      <Html center>
        <p style={{ color: "red" }}>⚠️ Nenhuma URL fornecida</p>
      </Html>
    );
  }

 
}