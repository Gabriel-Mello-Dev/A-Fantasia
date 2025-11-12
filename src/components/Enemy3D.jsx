import React, { useEffect } from "react";
import { Html, useGLTF } from "@react-three/drei";

function Enemy3D({ keyBind = "1", modelUrl, label = "Enemy", addEnemy }) {
  // 🧠 Escuta a tecla e spawna o inimigo
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === keyBind.toLowerCase()) {
        const x = Math.random() * 10 - 5;
        const z = Math.random() * 10 - 5;
        addEnemy([x, 0, z], modelUrl, label);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [keyBind, modelUrl, label, addEnemy]);

}

export { Enemy3D };
