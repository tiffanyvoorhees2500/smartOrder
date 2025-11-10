import "./Header.css";
import ProfileButton from "./ProfileButton";

export default function Header() {



  return (
    <header className="app-header">
      <div className="header-left">
        <img src="/logo-horizontal.png" alt="Logo" className="header-logo" />
        <span className="header-title">OHS with Rowley's</span>
      </div>

      <nav className="header-nav">
        <ProfileButton />
      </nav>
    </header>
  );
}
