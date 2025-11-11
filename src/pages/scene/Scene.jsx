import React, { Suspense, useEffect, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import { XR, XROrigin, createXRStore } from "@react-three/xr";
import { useNavigate } from "react-router-dom";
import { DraggableToken } from "../../components/DraggableToken";
import * as THREE from "three";

const xrStore = createXRStore();

function ModelContent({ url }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} scale={1} position={[0, 0, 0]} />;
}

function Scene() {
  const [modelUrl, setModelUrl] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [showSpawners, setShowSpawners] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  if (!modelUrl) return; // Espera o mapa carregar
  const mapName = modelUrl.split("/").pop(); // ex: "forest.glb"
  const savedTokens = localStorage.getItem(`tokens_${mapName}`);

  if (savedTokens) {
    try {
      const parsed = JSON.parse(savedTokens);
      setTokens(parsed);
    } catch (err) {
      console.warn("Erro ao carregar tokens salvos:", err);
    }
  } else {
    setTokens([]); // se não existir, limpa
  }
}, [modelUrl]);

// 💾 Salva tokens no localStorage sempre que mudarem
useEffect(() => {
  if (!modelUrl) return;
  const mapName = modelUrl.split("/").pop();
  localStorage.setItem(`tokens_${mapName}`, JSON.stringify(tokens));
}, [tokens, modelUrl]);

  // 🔁 Carrega o mapa salvo
  useEffect(() => {
    const saved = localStorage.getItem("selectedMap");
    if (saved) setModelUrl("/models/maps/" + saved);
    else navigate("/");
  }, [navigate]);

  // 💾 Carrega tokens do localStorage
  useEffect(() => {
    const savedTokens = localStorage.getItem("tokens");
    if (savedTokens) {
      try {
        const parsed = JSON.parse(savedTokens);
        setTokens(parsed);
      } catch (err) {
        console.warn("Erro ao carregar tokens salvos:", err);
      }
    }
  }, []);

  // 💾 Salva tokens no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem("tokens", JSON.stringify(tokens));
  }, [tokens]);

  // ❌ Remove um token
  const removeToken = useCallback((id) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ➕ Adiciona um token
  const addToken = useCallback((position, type = "default") => {
    let textureUrl = "/tokens/default.jpg";
    let label = "Token";

    if (type === "orc") {
      textureUrl = "/tokens/orc.jpg";
      label = "Orc";
    } else if (type === "knight") {
      textureUrl = "/tokens/knight.jpg";
      label = "Knight";
    }

    setTokens((prev) => [
      ...prev,
      {
        id: Date.now(),
        textureUrl,
        position,
        label,
      },
    ]);
  }, []);

useEffect(() => {
  const handleKey = async (e) => {
    const key = e.key.toLowerCase();

    if (key === "t") {
      // 👀 Alterna visibilidade dos spawners
      setShowSpawners((v) => !v);

    } else if (key === "r") {
      // 🔄 Reset total (todos tokens, inclusive GLBs)
      if (window.confirm("Tem certeza que deseja apagar TODOS os tokens?")) {
        setTokens([]);
        if (modelUrl) {
          const mapName = modelUrl.split("/").pop();
          localStorage.removeItem(`tokens_${mapName}`);
        }
      }

    } else if (key === "m") {
      // 🧹 Remove apenas os GLBs
      if (window.confirm("Deseja remover apenas os modelos GLB?")) {
        setTokens((prev) => prev.filter((t) => !t.isGLB));
        if (modelUrl) {
          const mapName = modelUrl.split("/").pop();
          const saved = localStorage.getItem(`tokens_${mapName}`);
          if (saved) {
            try {
              const parsed = JSON.parse(saved).filter((t) => !t.isGLB);
              localStorage.setItem(`tokens_${mapName}`, JSON.stringify(parsed));
            } catch (err) {
              console.warn("Erro ao limpar GLBs:", err);
            }
          }
        }
      }

    } else if (key === "g") {
      // 🧱 Adiciona um novo GLB
      const glbName = prompt("Digite o nome do GLB (ex: ikki.glb):");
      if (glbName) {
        const url = `/models/tokens3d/${glbName}`;

        try {
          // 🔍 Verifica se o arquivo realmente existe
          const response = await fetch(url, { method: "HEAD" });
          if (!response.ok) {
            alert(`⚠️ O modelo "${glbName}" não foi encontrado!`);
            console.warn(`[GLB] Arquivo não encontrado: ${url}`);
            return;
          }

          // ✅ Adiciona o GLB à lista
          addGLB([0, 0, 0], url);
          alert(`Modelo "${glbName}" adicionado com sucesso!`);
        } catch (err) {
          console.error("Erro ao verificar GLB:", err);
          alert("Erro ao tentar carregar o modelo.");
        }
      }
    }
  };

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, []);

  if (!modelUrl) {
    return <p style={{ color: "white" }}>Nenhum mapa selecionado</p>;
  }

  return (
    <div className="relative w-screen h-screen">
      {/* Botões flutuantes */}
      <div className="absolute z-10 flex flex-col gap-4 left-5 top-5">
        <button
          onClick={() => xrStore.enterVR()}
          className="px-5 py-3 text-white font-bold bg-purple-600 rounded-lg hover:bg-purple-500"
        >
          🥽 Enter VR
        </button>

        <button
          onClick={() => addToken([0, 0, 0], "orc")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          ➕ Orc
        </button>

        <button
          onClick={() => addToken([0, 0, 0], "knight")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ Knight
        </button>

        <button
          onClick={() => setShowSpawners((v) => !v)}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          🎯 Mostrar Spawners ({showSpawners ? "ON" : "OFF"})
        </button>
      </div>

      {/* Canvas 3D */}
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
              {/* Tokens dinâmicos */}
              {tokens.map((token) => (
                <DraggableToken
                  key={token.id}
                  {...token}
                  onDelete={() => removeToken(token.id)}
                />
              ))}

              {/* Modelo do mapa */}
              <ModelContent url={modelUrl} />
            </Suspense>

            {/* Plano do chão */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#444" />
            </mesh>

            {/* Spawners aparecem apenas quando showSpawners = true */}
            {showSpawners && (
              <>
                <mesh
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const { x, z } = e.point;
                    addToken([x, 0, z]);
                  }}
                  position={[0, 0, 0]}
                >
                  <boxGeometry args={[0.6, 0.6, 0.6]} />
                  <meshStandardMaterial color="#999" />
                </mesh>

                <mesh
                  position={[0, 1, 0]}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const { x, z } = e.point;
                    addToken([x, 0, z], "orc");
                  }}
                >
                  <boxGeometry args={[0.6, 0.6, 0.6]} />
                  <meshStandardMaterial color="#5ae000" />
                </mesh>

                <mesh
                  position={[0, 2, 0]}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const { x, z } = e.point;
                    addToken([x, 0, z], "knight");
                  }}
                >
                  <boxGeometry args={[0.6, 0.6, 0.6]} />
                  <meshStandardMaterial color="#007bff" />
                </mesh>
              </>
            )}

            <OrbitControls />
          </XROrigin>
        </XR>
      </Canvas>
    </div>
  );
}

export { Scene };
