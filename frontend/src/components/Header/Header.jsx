import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

 function Header({adminName = "UserName"}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <>
    
    <header className={styles.header}>
      <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>☰</button>
      <span className={styles.brand}> FreshBite POS</span>
      
        <div className="d-flex align-items-center gap-2">
          <span>{adminName}</span>
          <div className={styles.avatar}>
            {adminName ? adminName.charAt(0).toUpperCase() : "U"}
          </div>
        </div>

    </header>



     <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
          ✕
        </button>

        <nav className={styles.navLinks}>
          <button className={styles.logoutBtn} onClick={handleLogout} style={{ background: "none", border: "none", color: "inherit", textAlign: "left", cursor: "pointer", padding: "10px 20px", fontSize: "16px" }}>
            🚪 Logout
          </button>
        </nav>
      </div>

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}
      </>
  );
}

export default Header;