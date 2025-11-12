import React, { Suspense, useEffect, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import { XR, XROrigin, createXRStore } from "@react-three/xr";
import { useNavigate } from "react-router-dom";
import { DraggableToken } from "../../components/DraggableToken";
import * as THREE from "three";
import { SpawnerBox } from "../../components/SpawnerBox";
import { Model3D } from "../../components/Model3D";
import { PlayerTracker } from "./PlayerTracker";

const xrStore = createXRStore();

function ModelContent({ url }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} scale={1} position={[0, 0, 0]} />;
}

function Scene() {
  const [modelUrl, setModelUrl] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [showSpawners, setShowSpawners] = useState(false);
  const [showEnemies, setshowEnemies] = useState(false);
  const navigate = useNavigate();
const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 0, 0));

useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Shift") {
      // Move no eixo X positivo
      setPlayerPosition((prev) => new THREE.Vector3(prev.x + 0.1, prev.y, prev.z));
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);


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
 const addToken = useCallback(
  (type = "default") => {
    const TOKEN_TYPES = {
      default: { texture: "/tokens/default.jpg", label: "Token" },
      orc: { texture: "/tokens/orc.jpg", label: "Orc" },
      knight: { texture: "/tokens/knight.jpg", label: "Knight" },
      goblin: { texture: "/tokens/goblin.png", label: "Goblin" },
      troll: { texture: "/tokens/troll.jpg", label: "Troll" },
      daniel: { texture: "/tokens/daniel.png", label: "daniel" },
    };

    const { texture, label } = TOKEN_TYPES[type] || TOKEN_TYPES.default;

    // Usa posição atual do PlayerTracker
    const playerPos = playerPosition.clone();

    // Raycast para garantir que fique no chão
    const raycaster = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);
    raycaster.set(new THREE.Vector3(playerPos.x, playerPos.y + 1, playerPos.z), down);

    const groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial()
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -1;

    const intersects = raycaster.intersectObject(groundMesh, true);
    let groundY = -2;

    if (intersects.length > 0) {
      groundY = intersects[0].point.y + 0.08;
    }

    const finalPos = new THREE.Vector3(playerPos.x, groundY, playerPos.z);

    setTokens((prev) => [
      ...prev,
      {
        id: Date.now(),
        textureUrl: texture,
        position: finalPos,
        label,
      },
    ]);
  },
  [playerPosition]
);


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
const key= prompt("senha");

if (key=="123"){
        setshowEnemies((v) => !v);


}else{
  alert("senha errada")
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
<PlayerTracker
  offsetX={3}
  offsetY={0}
  offsetZ={1}
  onMove={(pos) => setPlayerPosition(pos)}
/>


            <Suspense
              
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
<SpawnerBox
  position={[playerPosition.x, playerPosition.y, playerPosition.z]}
  textureUrl="/tokens/orc.jpg"
  label="Orc"
  type="orc"
  addToken={() => addToken("orc")}
/>
    <SpawnerBox
      position={[playerPosition.x + 0.5, playerPosition.y, playerPosition.z]}
      textureUrl="/tokens/knight.jpg"
      label="Cavaleiro"
      type="knight"
  addToken={() => addToken("knight")}
    />

        <SpawnerBox
      position={[playerPosition.x + 1.2, playerPosition.y, playerPosition.z]}
      textureUrl="/tokens/daniel.png"
      label="daniel"
      type="daniel"
  addToken={() => addToken("daniel")}
    />
  </>
)}


            <Model3D 
              position={[0, 0, 0]}
            modelUrl={"/models/tokens3d/orc.glb"}
              onDelete={() => console.log("Inimigo removido!")}

            ></Model3D>

            <OrbitControls />
          </XROrigin>
        </XR>
      </Canvas>
    </div>
  );
}

export { Scene };
