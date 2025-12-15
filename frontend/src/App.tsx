import React, { useState, useEffect } from "react";
import "./App.css";

// =========================
// Types
// =========================

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

// Backend URL from Netlify
const API_URL = import.meta.env.VITE_API_URL;

// =========================
// Dark Mode
// =========================

const DarkModeContext = React.createContext<any>(null);

const DarkModeProvider = ({ children }: any) => {
  const [dark, setDark] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    localStorage.setItem("darkMode", String(dark));
  }, [dark]);

  return (
    <DarkModeContext.Provider value={{ dark, setDark }}>
      {children}
    </DarkModeContext.Provider>
  );
};

const useDarkMode = () => React.useContext(DarkModeContext);

// =========================
// Auth Context
// =========================

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) throw new Error("Registration failed");

    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

// =========================
// Login Component
// =========================

const Login: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErr("");
      await login(email, password);
    } catch {
      setErr("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🍬 Sweet Shop</h1>

        <form onSubmit={submit}>
          {err && <div className="error">{err}</div>}

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <button onClick={onToggle}>Don't have an account? Register</button>
      </div>
    </div>
  );
};

// =========================
// Register Component
// =========================

const Register: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErr("");
      await register(email, password, name);
    } catch {
      setErr("Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🍬 Sweet Shop</h1>

        <form onSubmit={submit}>
          {err && <div className="error">{err}</div>}
          <input placeholder="Name" required onChange={(e) => setName(e.target.value)} />
          <input placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required minLength={6} onChange={(e) => setPassword(e.target.value)} />

          <button type="submit">Register</button>
        </form>

        <button onClick={onToggle}>Already have an account? Login</button>
      </div>
    </div>
  );
};

// =========================
// Edit Sweet Modal
// =========================

const EditSweetModal = ({
  token,
  sweet,
  onClose,
  onSuccess,
}: {
  token: string;
  sweet: Sweet;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [name, setName] = useState(sweet.name);
  const [category, setCategory] = useState(sweet.category);
  const [price, setPrice] = useState(String(sweet.price));
  const [quantity, setQuantity] = useState(String(sweet.quantity));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`${API_URL}/api/sweets/${sweet.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        category,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      }),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Sweet</h2>

        <form onSubmit={submit}>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          <input value={category} onChange={(e) => setCategory(e.target.value)} required />
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />

          <button type="submit">Update</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

// =========================
// Add Sweet Modal
// =========================

const AddSweetModal = ({
  token,
  onClose,
  onSuccess,
}: {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/sweets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        category,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      }),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Sweet</h2>

        <form onSubmit={submit}>
          <input placeholder="Name" required onChange={(e) => setName(e.target.value)} />
          <input placeholder="Category" required onChange={(e) => setCategory(e.target.value)} />
          <input placeholder="Price" required type="number" step="0.01" onChange={(e) => setPrice(e.target.value)} />
          <input placeholder="Quantity" required type="number" onChange={(e) => setQuantity(e.target.value)} />

          <button type="submit">Add</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

// =========================
// Dashboard
// =========================

const Dashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const { dark, setDark } = useDarkMode();

  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [editSweet, setEditSweet] = useState<Sweet | null>(null);

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sweets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      setSweets(Array.isArray(data) ? data : data.sweets || []);
    } catch (err) {
      console.error("Failed to fetch sweets");
      setSweets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSweets = (Array.isArray(sweets) ? sweets : []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const purchase = async (id: string) => {
    await fetch(`${API_URL}/api/sweets/${id}/purchase`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity: 1 }),
    });
    fetchSweets();
  };

  const deleteSweet = async (id: string) => {
    if (!confirm("Delete sweet?")) return;

    await fetch(`${API_URL}/api/sweets/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchSweets();
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>🍬 Sweet Shop</h1>

        <div>
          <button onClick={() => setDark(!dark)}>
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <span>{user?.name} ({user?.role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="content">
        <input
          placeholder="Search sweets"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {user?.role === "ADMIN" && (
          <button onClick={() => setShowAdd(true)}>Add Sweet</button>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid">
            {filteredSweets.map((sweet) => (
              <div key={sweet.id} className="sweet-card">
                <h3>{sweet.name}</h3>
                <p>{sweet.category}</p>
                <p>${sweet.price}</p>
                <p>{sweet.quantity} in stock</p>

                <button
                  disabled={!sweet.quantity}
                  onClick={() => purchase(sweet.id)}
                >
                  Purchase
                </button>

                {user?.role === "ADMIN" && (
                  <>
                    <button onClick={() => setEditSweet(sweet)}>Edit</button>
                    <button onClick={() => deleteSweet(sweet.id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddSweetModal
          token={token!}
          onSuccess={fetchSweets}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editSweet && (
        <EditSweetModal
          token={token!}
          sweet={editSweet}
          onClose={() => setEditSweet(null)}
          onSuccess={fetchSweets}
        />
      )}
    </div>
  );
};

// =========================
// Main App
// =========================

const App: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);
  const { user } = useAuth();

  if (!user)
    return showLogin ? (
      <Login onToggle={() => setShowLogin(false)} />
    ) : (
      <Register onToggle={() => setShowLogin(true)} />
    );

  return <Dashboard />;
};

// =========================
// Export Wrapper
// =========================

export default function Wrapper() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </DarkModeProvider>
  );
}
