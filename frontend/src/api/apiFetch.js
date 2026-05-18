
const API_BASE = "http://localhost:3000/api";

async function apiFetch(path, option = {}) {

    const token = localStorage.getItem("lo_token");
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}`} : {}),
        },
        ...option,
    });
    
    const data = await res.json();

    if(!res.ok) throw new Error(data.msg || "Something went wrong");
    
    return data;
    
}

export default apiFetch;