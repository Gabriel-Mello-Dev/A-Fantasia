import { Routes, Route } from "react-router-dom";
import {Fichas, Home, Scene} from "./pages";
import { LayoutPadrao } from "./components/LayoutPadrao";

function AppRoutes() {
  return (
    <Routes>
      {/* LayoutPadrao é o “wrapper” das páginas */}
      <Route>
        <Route path="/" element={<Home />} />
        <Route path="/scene" element={<Scene />} />
        <Route path="/Fichas" element={<Fichas />} />
    
      </Route>



    </Routes>
  );
}

export default AppRoutes;
