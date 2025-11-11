import React from "react";
import { TextureLoader, BackSide } from "three";
import { useLoader } from "@react-three/fiber";

export function Background({ image }) {
  const texture = useLoader(TextureLoader, image);
  return (
    <mesh>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  );
}
