import { useEffect, useState } from "react";
import apiFetch from "../../../api/apiFetch";
import style from "./Staff.module.css";

function Staff() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Cashier");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentRole = localStorage.getItem("role") || "Cashier";
  const isSuperAdmin = currentRole === "Super Admin";
  const isTeamLeader = currentRole === "Team Leader";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/users");
      setUsers(data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userName || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({ userName, email, password, role }),
      });
      setSuccess("Staff member created successfully!");
      setUserName("");
      setEmail("");
      setPassword("");
      setRole("Cashier");
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to create staff member.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await apiFetch(`/users/${userId}`, {
        method: "DELETE",
      });
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  if (loading) return <div className={style.loading}>Loading Staff...</div>;

  return (
    <div className={style.container}>
      <div className={style.grid}>
        {/* Left Side: Register New Staff */}
        <div className={style.formCard}>
          <h3>Add New Staff Member</h3>
          <p className={style.subText}>Only Admins and Super Admins can add new accounts.</p>
          <form onSubmit={handleCreateUser}>
            <div className={style.inputGroup}>
              <label>Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Full Name"
                required
              />
            </div>
            <div className={style.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className={style.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div className={style.inputGroup}>
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Cashier">Cashier</option>
                {isSuperAdmin && <option value="Team Leader">Team Leader</option>}
                {isSuperAdmin && <option value="Super Admin">Super Admin</option>}
              </select>
            </div>
            {error && <p className={style.error}>{error}</p>}
            {success && <p className={style.success}>{success}</p>}
            <button type="submit" className={style.submitBtn}>
              Create Account
            </button>
          </form>
        </div>

        {/* Right Side: Staff Directory */}
        <div className={style.listCard}>
          <h3>Staff Directory</h3>
          <div className={style.staffList}>
            {users.map((user) => (
              <div key={user._id} className={style.staffItem}>
                <div className={style.staffInfo}>
                  <div className={style.avatar}>
                    {user.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className={style.staffName}>{user.userName}</h4>
                    <p className={style.staffEmail}>{user.email}</p>
                  </div>
                </div>
                <div className={style.staffActions}>
                  <span className={`${style.roleBadge} ${style[user.role.replace(" ", "")]}`}>
                    {user.role}
                  </span>
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className={style.deleteBtn}
                      title="Delete User"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Staff;
