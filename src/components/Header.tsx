import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const LINKS = [
  { to: "/analysis", label: "DNA 분석" },
  { to: "/worldcup", label: "사투리 월드컵" },
  { to: "/contest", label: "사투리 콘테스트" },
  { to: "/archive", label: "말의 기록" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="wrap">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          사투리 <b>DNA</b>
        </Link>
        <nav className={`nav ${open ? "open" : ""}`}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="menu-btn" aria-label="메뉴" onClick={() => setOpen((v) => !v)}>
          ☰
        </button>
      </div>
    </header>
  );
}