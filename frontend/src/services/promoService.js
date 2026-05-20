import apiFetch from "../api/apiFetch";

export const getAllPromos   = ()           => apiFetch("/promos");
export const createPromo   = (data)        => apiFetch("/promos", { method: "POST", body: JSON.stringify(data) });
export const updatePromo   = (id, data)    => apiFetch(`/promos/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePromo   = (id)          => apiFetch(`/promos/${id}`, { method: "DELETE" });
export const validatePromo = (code, amount) => apiFetch("/promos/validate", { method: "POST", body: JSON.stringify({ code, orderAmount: amount }) });
