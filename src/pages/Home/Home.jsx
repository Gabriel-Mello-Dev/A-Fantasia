import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca lista de mapas
    const fetchMaps = async () => {
      try {
        const res = await fetch("/models/maps/manifest.json");
        if (!res.ok) throw new Error("Erro ao carregar manifest.json");
        const data = await res.json();
        setMaps(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMaps();
  }, []);

  const handleSelect = (file) => {
    localStorage.setItem("selectedMap", file);
    navigate("/scene");
  };

  if (loading) return <div className="text-white">Carregando mapas...</div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <h1 className="mb-8 text-4xl font-bold text-white">🎮 Escolha seu Mapa</h1>

      <div className="grid grid-cols-2 gap-6">
        {maps.map((map, i) => (
          <button
            key={i}
            onClick={() => handleSelect(map.file)}
            className="px-8 py-6 text-xl font-bold text-white transition-all duration-300 transform shadow-2xl rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-110 hover:shadow-purple-500/50"
          >
            {map.name}
          </button>
        ))}

<button onClick={()=>navigate("/Fichas")}>Fichas</button>

      </div>
    </div>
  );
}

export { Home };