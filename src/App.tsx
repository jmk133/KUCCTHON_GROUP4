import Header from "./components/Header";
import Hero from "./sections/Hero";
import Explore from "./sections/Explore";
import Analysis from "./sections/Analysis";
import Worldcup from "./sections/Worldcup";
import Contest from "./sections/Contest";
import Archive from "./sections/Archive";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Explore />
        <Analysis />
        <Worldcup />
        <Contest />
        <Archive />
      </main>
      <footer className="footer">
        <div className="wrap">
          <a href="#home" className="logo">
            사투리 <b>DNA</b>
          </a>
          <span>서로 다른 말이 모여, 더 다채로운 우리.</span>
          <span>KUCCTHON 4조 · 프로토타입</span>
        </div>
      </footer>
    </>
  );
}
