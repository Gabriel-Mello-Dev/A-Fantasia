import React, { useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Handle, HandleTarget } from "@react-three/handle";

export function InteractiveDoor({ textureUrl, position = [0, 0, 0], size = [1, 2] }) {
  const targetRef = useRef();
  const texture = useLoader(TextureLoader, textureUrl);

  return (
    // HandleTarget define o pivô da porta
    <HandleTarget ref={targetRef} position={position}>
      {/* O Handle define o que será manipulável */}
      <Handle
        targetRef={targetRef}
        translate={false} // Porta não se move no espaço
        rotate={{ x: false, y: true, z: false }} // Gira só no eixo Y
        scale={false} // Não escala
      >
        {/* Porta em si */}
        <mesh castShadow receiveShadow position={[size[0]/2, size[1]/2, 0]}>
          <planeGeometry args={size} />
          <meshStandardMaterial map={texture} />
        </mesh>
      </Handle>
    </HandleTarget>
  );
}
