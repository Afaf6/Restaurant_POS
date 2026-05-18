import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
// import api from "../../api/apiFetch";

function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // const res = await api.post("/api/auth/login", form);
            // localStorage.setItem("token", res.data.token);
            // localStorage.setItem("Auth", JSON.stringify({ role: res.data.role }));
            // if (res.data.role === "admin") navigate("/dashboard");
            // else navigate("/pos");

            navigate("/");
        } catch (err) {
            setError(err.response?.data?.msg || "Something went wrong");
        }
    };

    return (
        <div className={styles.page}>

            <div className={styles.formSide}>

                <div className={styles.logo}>
                    <span className={styles.logoIcon}>🍴</span>
                </div>

                <h1 className={styles.title}>Login in </h1>

                <form className={styles.form} onSubmit={handleSubmit}>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.field}>
                        <label>Your Email</label>
                        <div className={styles.inputWrap}>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            <i className="fa-solid fa-envelope" />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <div className={styles.labelRow}>
                            <label> Password </label>
                        </div>
                        <div className={styles.inputWrap}>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <i className="fa-solid fa-lock" />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        Submit
                    </button>


                </form>

                 <p className={styles.registerLink}>
                   Don't have an account
                    <Link to="/register"> Create a new account </Link>
                </p>
            </div>

            
            <div className={styles.imageSide}>
               
                <img src="/src/assets/unnamed.png" alt="restaurant" className={styles.bgImage} />

               
                <div className={styles.imagePlaceholder} />

                <div className={styles.imageOverlay}>
                    <span className={styles.tag}>✨</span>
                    <h2>  Discover New Tastes</h2>
                    
                </div>
            </div>

        </div>
    );
}

export default Login;

               