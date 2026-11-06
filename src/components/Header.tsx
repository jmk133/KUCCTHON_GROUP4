import { useState } from "react";

const LINKS = [
  { href: "#analysis", label: "DNA 분석" },
  { href: "#worldcup", label: "말투 찾기" },
  { href: "#contest", label: "사투리 콘테스트" },
  { href: "#archive", label: "말의 기록" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="wrap">
        <a href="#home" className="logo">
          사투리 <b>DNA</b>
        </a>
        <nav className={`nav ${open ? "open" : ""}`}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <button className="menu-btn" aria-label="메뉴" onClick={() => setOpen((v) => !v)}>
          ☰
        </button>
      </div>
    </header>
  );
}