import React from "react";
import { Canvas } from "@react-three/fiber";
import { XR } from "@react-three/xr";
import { OrbitControls } from "@react-three/drei";
import { Outlet } from "react-router-dom";

function LayoutPadrao({ xrStore, Scene }) {
  const enterVr = () => xrStore.enterVR();
  const enterAr = () => xrStore.enterAR();

  return (
    <>
      {/* Botões fixos fora do Canvas */}
    <div className="absolute z-10 flex flex-col gap-4 left-5 top-5">
        <button
          onClick={enterVr}
          className="px-5 py-3 font-bold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:scale-105 hover:shadow-2xl"
        >
          🥽 Enter VR
        </button>
        <button
          onClick={enterAr}
          className="px-5 py-3 font-bold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-green-400 to-blue-500 rounded-xl hover:scale-105 hover:shadow-2xl"
        >
          📱 Enter AR
        </button>
      </div>


      {/* Canvas 3D só se houver Scene */}
      {Scene && (
        <Canvas
          shadows
          gl={{ antialias: true }}
          frameloop="always"
          camera={{ position: [0, 0, 15], fov: 25 }}
          style={{ width: "100vw", height: "100vh" }}
        >
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={20}
            minAzimuthAngle={-0.4}
            maxAzimuthAngle={0.4}
          />
          <XR store={xrStore}>
            <Scene />
          </XR>
        </Canvas>
      )}

      {/* Conteúdo React normal */}
      <Outlet />
    </>
  );
}

export { LayoutPadrao };