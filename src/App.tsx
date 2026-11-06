import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";
import Worldcup from "./pages/Worldcup";
import Contest from "./pages/Contest";
import Archive from "./pages/Archive";

// 페이지가 바뀌면 맨 위로 이동
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/worldcup" element={<Worldcup />} />
          <Route path="/contest" element={<Contest />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="wrap">
          <Link to="/" className="logo">
            사투리 <b>DNA</b>
          </Link>
          <span>서로 다른 말이 모여, 더 다채로운 우리.</span>
          <span>KUCCTHON 4조 · 프로토타입</span>
        </div>
      </footer>
    </>
  );
}
