import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as THREE from "three";

function DraggableToken({ position = [0, 0, 0], textureUrl, label = "Token" }) {
  const ref = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState(position);
  const [options, setOptions] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedTexture, setSelectedTexture] = useState(textureUrl);

  // Carrega textura dinamicamente quando muda
  const texture = selectedTexture ? useTexture(selectedTexture) : null;

  // Atualiza posição suavemente
  useFrame(() => {
    if (ref.current) {
      ref.current.position.lerp(new THREE.Vector3(...pos), 0.2);
    }
  });

  // Carrega manifest.json com opções dos tokens
  useEffect(() => {
    fetch("/tokens/manifest.json")
      .then((res) => res.json())
      .then((data) => setOptions(data))
      .catch((err) => console.error("Erro ao carregar manifest.json:", err));
  }, []);

  const onPointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const onPointerUp = (e) => {
    e.stopPropagation();
    setIsDragging(false);
    setShowMenu(true); // abre menu ao soltar clique
  };

  const onPointerMove = (e) => {
    if (isDragging) {
      const point = e.point;
      setPos([point.x, 0, point.z]); // move no plano do chão
    }
  };

  const handleSelect = (option) => {
    setSelectedTexture(option.image);
    setShowMenu(false);
  };

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    >
      <planeGeometry args={[1.5, 3]} />
      {texture ? (
        <meshBasicMaterial map={texture} transparent />
      ) : (
        <meshStandardMaterial color="orange" />
      )}

      {/* Interface HTML flutuante */}
      {showMenu && (
        <Html distanceFactor={10}>
          <div
            style={{
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "8px",
              borderRadius: "8px",
              minWidth: "140px",
            }}
          >
            <strong>Escolha o token:</strong>
            <ul style={{ listStyle: "none", padding: 0, margin: "8px 0" }}>
              {options.map((opt, i) => (
                <li
                  key={i}
                  style={{
                    cursor: "pointer",
                    padding: "4px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.2)",
                  }}
                  onClick={() => handleSelect(opt)}
                >
                  <img
                    src={opt.image}
                    alt={opt.name}
                    width={24}
                    height={24}
                    style={{
                      verticalAlign: "middle",
                      marginRight: "6px",
                      borderRadius: "4px",
                    }}
                  />
                  {opt.name}
                </li>
              ))}
            </ul>
            <button
              style={{
                width: "100%",
                marginTop: "4px",
                background: "#444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "4px",
                cursor: "pointer",
              }}
              onClick={() => setShowMenu(false)}
            >
              Fechar
            </button>
          </div>
        </Html>
      )}
    </mesh>
  );
}

export { DraggableToken };
