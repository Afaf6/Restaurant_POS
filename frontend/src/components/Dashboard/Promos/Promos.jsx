import { useState, useEffect } from "react";
import { getAllPromos, createPromo, updatePromo, deletePromo } from "../../../services/promoService";
import style from "./Promos.module.css";

const empty = { code: "", description: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUses: "", expiryDate: "", isActive: true };

export default function Promos() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAllPromos();
      setPromos(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiryDate: form.expiryDate || null,
      };
      if (editId) {
        await updatePromo(editId, payload);
        setSuccess("Promo updated!");
      } else {
        await createPromo(payload);
        setSuccess("Promo created!");
      }
      setForm(empty); setEditId(null);
      load();
    } catch (e) { setError(e.message); }
  };

  const handleEdit = (p) => {
    setEditId(p._id);
    setForm({
      code: p.code,
      description: p.description || "",
      discountType: p.discountType,
      discountValue: p.discountValue,
      minOrderAmount: p.minOrderAmount || "",
      maxUses: p.maxUses || "",
      expiryDate: p.expiryDate ? p.expiryDate.slice(0, 10) : "",
      isActive: p.isActive
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this promo?")) return;
    try { await deletePromo(id); load(); }
    catch (e) { setError(e.message); }
  };

  const handleToggle = async (p) => {
    try { await updatePromo(p._id, { isActive: !p.isActive }); load(); }
    catch (e) { setError(e.message); }
  };

  const isExpired = (p) => p.expiryDate && new Date() > new Date(p.expiryDate);
  const isExhausted = (p) => p.maxUses !== null && p.usedCount >= p.maxUses;

  return (
    <div className={style.container}>
      <div className={style.grid}>

        {/* ── Form ── */}
        <div className={style.formCard}>
          <h3>{editId ? "Edit Promo" : "Create Promo Code"}</h3>
          <p className={style.sub}>Only Super Admins can manage promo codes.</p>

          <form onSubmit={handleSubmit} className={style.form}>
            <div className={style.row}>
              <div className={style.field}>
                <label>Code *</label>
                <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. SAVE20" required disabled={!!editId} />
              </div>
              <div className={style.field}>
                <label>Status</label>
                <label className={style.toggle}>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                  <span className={style.slider} />
                  <span className={style.toggleLabel}>{form.isActive ? "Active" : "Inactive"}</span>
                </label>
              </div>
            </div>

            <div className={style.field}>
              <label>Description</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. 20% off all orders" />
            </div>

            <div className={style.row}>
              <div className={style.field}>
                <label>Discount Type *</label>
                <select name="discountType" value={form.discountType} onChange={handleChange}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div className={style.field}>
                <label>Discount Value *</label>
                <input type="number" name="discountValue" value={form.discountValue} onChange={handleChange} placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 5.00"} min="0" step="0.01" required />
              </div>
            </div>

            <div className={style.row}>
              <div className={style.field}>
                <label>Min Order Amount ($)</label>
                <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} placeholder="0 = no minimum" min="0" step="0.01" />
              </div>
              <div className={style.field}>
                <label>Max Uses</label>
                <input type="number" name="maxUses" value={form.maxUses} onChange={handleChange} placeholder="Leave empty = unlimited" min="1" />
              </div>
            </div>

            <div className={style.field}>
              <label>Expiry Date</label>
              <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} min={new Date().toISOString().slice(0, 10)} />
            </div>

            {error   && <p className={style.error}>{error}</p>}
            {success && <p className={style.success}>{success}</p>}

            <div className={style.formActions}>
              {editId && <button type="button" className={style.cancelBtn} onClick={() => { setForm(empty); setEditId(null); }}>Cancel</button>}
              <button type="submit" className={style.submitBtn}>{editId ? "Update Promo" : "Create Promo"}</button>
            </div>
          </form>
        </div>

        {/* ── List ── */}
        <div className={style.listCard}>
          <h3>Active Promo Codes</h3>
          {loading ? <p className={style.sub}>Loading...</p> : (
            <div className={style.promoList}>
              {promos.length === 0 && <p className={style.empty}>No promo codes yet.</p>}
              {promos.map(p => (
                <div key={p._id} className={`${style.promoItem} ${!p.isActive || isExpired(p) || isExhausted(p) ? style.dimmed : ""}`}>
                  <div className={style.promoTop}>
                    <span className={style.promoCode}>{p.code}</span>
                    <div className={style.promoBadges}>
                      {isExpired(p)   && <span className={`${style.badge} ${style.badgeRed}`}>Expired</span>}
                      {isExhausted(p) && <span className={`${style.badge} ${style.badgeRed}`}>Exhausted</span>}
                      {!isExpired(p) && !isExhausted(p) && (
                        <span className={`${style.badge} ${p.isActive ? style.badgeGreen : style.badgeGray}`}>
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </div>
                  </div>

                  {p.description && <p className={style.promoDesc}>{p.description}</p>}

                  <div className={style.promoMeta}>
                    <span>💰 {p.discountType === "percentage" ? `${p.discountValue}% off` : `$${p.discountValue} off`}</span>
                    {p.minOrderAmount > 0 && <span>🛒 Min ${p.minOrderAmount}</span>}
                    {p.maxUses !== null && <span>🔢 {p.usedCount}/{p.maxUses} uses</span>}
                    {!p.maxUses && <span>♾️ {p.usedCount} uses</span>}
                    {p.expiryDate && <span>📅 Expires {new Date(p.expiryDate).toLocaleDateString("en-US")}</span>}
                  </div>

                  <div className={style.promoActions}>
                    <button className={style.toggleBtn} onClick={() => handleToggle(p)}>
                      {p.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button className={style.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                    <button className={style.deleteBtn} onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
