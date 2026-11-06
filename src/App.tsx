import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Dna from "./pages/Dna";
import Worldcup from "./pages/Worldcup";
import Board from "./pages/Board";

export default function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: 16, padding: 16 }}>
        <Link to="/">홈</Link>
        <Link to="/dna">사투리 DNA</Link>
        <Link to="/worldcup">월드컵</Link>
        <Link to="/board">게시판</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dna" element={<Dna />} />
        <Route path="/worldcup" element={<Worldcup />} />
        <Route path="/board" element={<Board />} />
      </Routes>
    </div>
  );
}
