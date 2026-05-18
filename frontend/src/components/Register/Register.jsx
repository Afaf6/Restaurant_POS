
import { useState } from "react";
//import api from "../../api/apiFetch";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

function Register() {
    const [form, setForm] = useState({
        userName: "",
        email: "",
        phone: "",
        password: "",
        role: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //await api.post("/api/auth/register", form);

            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.msg || "Something went wrong");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
 
               
                <div className={styles.hero}>
                
                    <div className={styles.heroBg}>
                        <span style={{ fontSize: 60 }}>🍽️</span>
                    </div>
 
                    <div className={styles.overlay}>
                        <h1>
                            Create New Account
                        </h1>
                        <p>
                            Enroll to our Restaurant
                        </p>
                    </div>
                </div>
 
                
                <form className={styles.form} onSubmit={handleSubmit}>
 
                    {error && <p className={styles.error}>{error}</p>}
 
                    <div className={styles.field}>
                       <label>User Name</label>
                        <div className={styles.inputWrap}>
                            <i className="fa-solid fa-user" />
                            <input
                                type="text"
                                name="userName"
                                placeholder="Your name"
                                value={form.userName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
 
                    <div className={styles.field}>
                        <label>Email</label>
                        <div className={styles.inputWrap}>
                            <i className="fa-solid fa-envelope" />
                            <input
                                type="email"
                                name="email"
                                placeholder="example@freshbite.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
 
                    <div className={styles.field}>
                        <label>Usesr Phone Number</label>
                        <div className={styles.inputWrap}>
                            <i className="fa-solid fa-phone" />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="05x xxxx xxx"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
 
                    <div className={styles.field}>
                        <label>Password</label>
                        <div className={styles.inputWrap}>
                            <i className="fa-solid fa-lock" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Your Password ••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
    <label>Select Your Role</label>
    <div className={styles.radioGroup}>
        {/* خيار الأدمن */}
        <label className={styles.radioLabel}>
            <input
                type="radio"
                name="role"
                value="Admin"
                checked={form.role === "Admin"}
                onChange={handleChange}
                required
            />
            <span>👑 Admin</span>
        </label>

        {/* خيار الكاشير */}
        <label className={styles.radioLabel}>
            <input
                type="radio"
                name="role"
                value="Cashier"
                checked={form.role === "Cashier"}
                onChange={handleChange}
                required
            />
            <span>💰 Cashier</span>
        </label>
    </div>
</div>
                    

    
                    <button type="submit" className={styles.submitBtn}>
                        Register                  
                    </button>
 
                    <p className={styles.loginLink}>
                        Are you have account?
                        <Link to="/login">Login in </Link>
                    </p>
 
                </form>
            </div>
        </div>
      
    );
}

export default Register;
