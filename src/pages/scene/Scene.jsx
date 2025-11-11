import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import { XR, XROrigin, createXRStore } from "@react-three/xr";
import { useNavigate } from "react-router-dom";
import { DraggableToken } from "../../components/DraggableToken";
const xrStore = createXRStore();

function ModelContent({ url }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} scale={1} position={[0, 0, 0]} />;
}

function Scene() {
  const [modelUrl, setModelUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("selectedMap");
    if (saved) setModelUrl("/models/maps/" + saved);
    else navigate("/");
  }, []);

const [tokens, setTokens] = useState([]);

  // Adiciona token manualmente (pode virar um botão futuramente)
 const addToken = (position) => {
    setTokens((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "orc",
        textureUrl: "/textures/orc.jpg",
        position,
        label: "orc",
      },
    ]);
  };
  if (!modelUrl) {
    return <p style={{ color: "white" }}>Nenhum mapa selecionado</p>;
  }

  return (
    <div className="relative w-screen h-screen">
      {/* Botão VR */}
      <div className="absolute z-10 flex flex-col gap-4 left-5 top-5">
        <button
          onClick={() => xrStore.enterVR()}
          className="px-5 py-3 text-white font-bold bg-purple-600 rounded-lg hover:bg-purple-500"
        >
          🥽 Enter VR
        </button>

  <button
          onClick={() => addToken("orc")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          ➕ Orc
        </button>
        <button
          onClick={() => addToken("knight")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ Knight
        </button>

      </div>

      {/* Canvas 100% tela */}
      <Canvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
        camera={{ position: [0, 1.5, 4], fov: 50 }}
      >
        <XR store={xrStore}>
          <XROrigin>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} />
            <Suspense
              fallback={
                <Html center>
                  <p style={{ color: "white" }}>Carregando modelo...</p>
                </Html>
              }
            >

   {tokens.map((token) => (
              <DraggableToken key={token.id} {...token} />
            ))}
            
              <ModelContent url={modelUrl} />
            </Suspense>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#444" />
            </mesh>
   <mesh
              position={[0, 0, 0]}
              onPointerDown={(e) => {
                e.stopPropagation();
                const { x, z } = e.point;
                addToken([x, 0, z]);
              }}
            >
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial color="limegreen" />
            </mesh>

            <OrbitControls />
          </XROrigin>
        </XR>
      </Canvas>
    </div>
  );
}

export { Scene };
