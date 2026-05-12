import { useState, useEffect } from "react";
import styles from "./Header.module.css";
import { isAuthenticated, login, logout } from "../../services/authService";

 function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  const handleAuth = async () => {
    if (isLoggedIn) {
      logout();
      setIsLoggedIn(false);
      window.location.reload();
    } else {
      const email = prompt("Enter email:", "admin@freshbite.com");
      const password = prompt("Enter password:", "admin123");
      if (email && password) {
        try {
          await login(email, password);
          setIsLoggedIn(true);
          alert("Login successful!");
          window.location.reload();
        } catch (err) {
          alert(err.message);
        }
      }
    }
  };

  return (
    <header className={styles.header}>
      <span className={styles.hamburger}>☰</span>
      <span className={styles.brand}> FreshBite POS</span>
      <div 
        className={styles.avatar} 
        onClick={handleAuth}
        title={isLoggedIn ? "Logout" : "Login"}
        style={{ cursor: "pointer", backgroundColor: isLoggedIn ? "#2ecc71" : "#95a5a6" }}
      >
        {isLoggedIn ? "A" : "L"}
      </div>
    </header>
  );
}

export default Header;