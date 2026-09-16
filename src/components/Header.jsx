import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/images/logo.jpg";
import { APP_NAME, CONTACT_NUMBER, FACEBOOK_URL } from '../config';
import {FaFacebook} from "react-icons/fa"

export default function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header style={styles.header}>
      <div className="container" style={styles.bar}>
        {/* <Link to="/" style={styles.logo} onClick={() => setOpen(false)}>
          <span style={styles.logoMark}>◆</span> {APP_NAME}
        </Link> */}
        <Link to="/" style={styles.logo} onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt="Ya Shams Enterprise"
            style={{
              height: "65px",
              width: "auto",
              objectFit: "contain",
              display: "block",
              borderRadius: "4px", // optional, if the logo has a background/edges
              cursor: "pointer", // if clicking it navigates home
            }}
          /> 
          <span>{APP_NAME}</span>
        </Link>

        <button
          style={styles.menuBtn}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"}
        </button>

        <nav style={styles.nav} className={open ? "open" : ""}>
          {/* <NavLink to="/" end style={({isActive}) => ({...styles.navLink, ...Header(isActive ? styles.navLinkActive :{}), })} onClick={() => setOpen(false)}>
            Fleet
          </NavLink> */}
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
            onClick={() => setOpen(false)}
          >
            Fleet
          </NavLink>
          <a
            href="#how-it-works"
            style={styles.navLink}
            onClick={() => setOpen(false)}
          >
            How it works
          </a>
          <a
               href={`tel:${CONTACT_NUMBER.replace(/\s+/g, "")}`}
            style={styles.navLink}
          >
            📞 {CONTACT_NUMBER}
          </a>
          <a 
          href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.navLink}
            aria-label="Facebook"
          >
            {/* simple Facebook glyph; swap for an icon component/library if you use one */}
            <span style={{ fontSize: "1.1rem" }}><FaFacebook size={20} /></span>
          </a>

          <Link
            to="/admin"
            style={{ ...styles.navLink, ...styles.adminLink }}
            onClick={() => setOpen(false)}
          >
            {isAdmin ? "Admin panel" : "Admin login"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: "var(--ink)",
    position: "sticky",
    top: 0,
    zIndex: 40,
  },
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 68,
    position: "relative",
  },
  logo: {
    fontFamily: "var(--font-display)",
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "var(--paper)",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  logoMark: { color: "var(--amber)", fontSize: "0.9rem" },
  menuBtn: {
    display: "none",
    background: "transparent",
    border: "none",
    color: "var(--paper)",
    fontSize: "1.4rem",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 28,
  },
  navLink: {
    color: "var(--paper)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.95rem",
    paddingBottom: 4,
    borderBottom: "2px solid transparent",
  },
  adminLink: {
    border: "1.5px solid var(--amber)",
    color: "var(--amber)",
    padding: "7px 14px",
    borderRadius: "var(--radius-s)",
    borderBottom: "1.5px solid var(--amber)",
  },
  adminLinkActive: {
    background: "var(--amber)",
    color: "var(--ink)",
  },
  navOpen: {},

  navLinkActive: {
    borderBottom: "2px solid var(--amber)",
  },
};

// Responsive behavior via injected stylesheet (keeps this file self-contained)
if (
  typeof document !== "undefined" &&
  !document.getElementById("header-responsive-styles")
) {
  const style = document.createElement("style");
  style.id = "header-responsive-styles";
  style.textContent = `
    @media (max-width: 720px) {
      header nav {
        position: absolute;
        top: 68px;
        left: 0;
        right: 0;
        background: var(--ink);
        flex-direction: column;
        align-items: flex-start;
        padding: 16px 24px 24px;
        display: none;
        gap: 18px;
        border-top: 1px solid rgba(255,255,255,0.12);
      }
      header nav.open { display: flex; }
      header button[aria-label] { display: block !important; }
    }
  `;
  document.head.appendChild(style);
}
