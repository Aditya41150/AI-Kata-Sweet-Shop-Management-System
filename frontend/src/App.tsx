import React, { useState, useEffect } from 'react';
import './App.css';

// ========= TYPES ========= //
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

const API_URL = import.meta.env.VITE_API_URL;

// ========= AUTH CONTEXT ========= //
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) throw new Error("Registration failed");

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
  if (!ctx) throw new Error("useAuth must be inside provider");
  return ctx;
};

// ========= LOGIN COMPONENT ========= //
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
      setErr("Invalid email or password");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🍬 Sweet Shop</h1>
        <form onSubmit={submit}>
          {err && <div className="error">{err}</div>}
          <input value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Password" />
          <button type="submit">Login</button>
        </form>

        <button onClick={onToggle}>Create Account</button>
      </div>
    </div>
  );
};

// ========= REGISTER COMPONENT ========= //
const Register: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Name" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Password" />
          <button type="submit">Register</button>
        </form>

        <button onClick={onToggle}>Already have an account?</button>
      </div>
    </div>
  );
};

// ========= DASHBOARD ========= //
const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sweets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        console.warn("Unauthorized – logging out");
        logout();
        return;
      }

      const data = await res.json();

      // backend returns array, not { sweets: [] }
      setSweets(Array.isArray(data) ? data : data.sweets || []);
    } catch {
      setSweets([]);
    }
  };

  const addSweet = async (sweet: Sweet) => {
    await fetch(`${API_URL}/api/sweets`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(sweet),
    });
    fetchSweets();
  };

  const deleteSweet = async (id: string) => {
    await fetch(`${API_URL}/api/sweets/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSweets();
  };

  const purchase = async (id: string) => {
    await fetch(`${API_URL}/api/sweets/${id}/purchase`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ quantity: 1 }),
    });
    fetchSweets();
  };

  const filtered = sweets.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="nav">
        <h2>🍬 Sweet Shop</h2>
        <div>
          {user?.name} ({user?.role})
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <input
        placeholder="Search sweets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {user?.role === "ADMIN" && (
        <button onClick={() => setShowAdd(true)}>Add Sweet</button>
      )}

      <div className="sweets-list">
        {filtered.map((sweet) => (
          <div key={sweet.id} className="sweet-card">
            <h3>{sweet.name}</h3>
            <p>{sweet.category}</p>
            <p>${sweet.price}</p>
            <p>{sweet.quantity} in stock</p>

            <button disabled={!sweet.quantity} onClick={() => purchase(sweet.id)}>
              Purchase
            </button>

            {user?.role === "ADMIN" && (
              <button onClick={() => deleteSweet(sweet.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <AddSweetModal
          token={token!}
          onClose={() => setShowAdd(false)}
          onSuccess={fetchSweets}
        />
      )}
    </div>
  );
};

// ========= ADD SWEET MODAL ========= //
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
  const [qty, setQty] = useState("");

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
        quantity: parseInt(qty),
      }),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="modal">
      <form onSubmit={submit}>
        <h3>Add Sweet</h3>

        <input placeholder="Name" onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Category" onChange={(e) => setCategory(e.target.value)} required />
        <input placeholder="Price" type="number" step="0.01" onChange={(e) => setPrice(e.target.value)} required />
        <input placeholder="Quantity" type="number" onChange={(e) => setQty(e.target.value)} required />

        <button type="submit">Add</button>
        <button onClick={onClose} type="button">Cancel</button>
      </form>
    </div>
  );
};

// ========= MAIN APP ========= //
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

export default function Wrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
