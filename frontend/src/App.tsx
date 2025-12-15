import React, { useState, useEffect } from 'react';
import './App.css';

// Types
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

// Auth Context
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    if (!response.ok) throw new Error('Registration failed');
    
    await login(email, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Login Component
const Login: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="emoji">🍬</div>
          <h1>Sweet Shop</h1>
          <p>Welcome back!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
        
        <div className="auth-toggle">
          <button onClick={onToggle}>
            Don't have an account? Register
          </button>
        </div>
      </div>
    </div>
  );
};

// Register Component
const Register: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, name);
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="emoji">🍬</div>
          <h1>Sweet Shop</h1>
          <p>Create your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>
        
        <div className="auth-toggle">
          <button onClick={onToggle}>
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sweets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSweets(data.sweets);
    } catch (err) {
      console.error('Failed to fetch sweets');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/sweets/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: 1 })
      });
      fetchSweets();
    } catch (err) {
      alert('Purchase failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sweet?')) return;
    
    try {
      await fetch(`http://localhost:3000/api/sweets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchSweets();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredSweets = sweets.filter(sweet =>
    sweet.name.toLowerCase().includes(search.toLowerCase()) ||
    sweet.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <span className="nav-emoji">🍬</span>
            <h1>Sweet Shop</h1>
          </div>
          <div className="nav-actions">
            <span className="user-info">
              {user?.name} {user?.role === 'ADMIN' && '(Admin)'}
            </span>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="main-content">
        <div className="controls">
          <input
            type="text"
            placeholder="Search sweets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {user?.role === 'ADMIN' && (
            <button onClick={() => setShowAddModal(true)} className="btn-add">
              Add Sweet
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="sweets-grid">
            {filteredSweets.map(sweet => (
              <div key={sweet.id} className="sweet-card">
                <div className="sweet-emoji">🍭</div>
                <h3>{sweet.name}</h3>
                <p className="category">{sweet.category}</p>
                <div className="sweet-details">
                  <span className="price">${sweet.price.toFixed(2)}</span>
                  <span className={`stock ${sweet.quantity > 0 ? 'in-stock' : 'out-stock'}`}>
                    {sweet.quantity} in stock
                  </span>
                </div>
                <div className="sweet-actions">
                  <button
                    onClick={() => handlePurchase(sweet.id)}
                    disabled={sweet.quantity === 0}
                    className="btn-purchase"
                  >
                    Purchase
                  </button>
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(sweet.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredSweets.length === 0 && !loading && (
          <div className="no-results">No sweets found</div>
        )}
      </div>

      {showAddModal && (
        <AddSweetModal
          token={token!}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchSweets();
          }}
        />
      )}
    </div>
  );
};

// Add Sweet Modal
const AddSweetModal: React.FC<{
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ token, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3000/api/sweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          category,
          price: parseFloat(price),
          quantity: parseInt(quantity)
        })
      });
      onSuccess();
    } catch (err) {
      alert('Failed to add sweet');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Sweet</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Add Sweet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App
const App: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);
  
  return (
    <AuthProvider>
      <AuthWrapper showLogin={showLogin} setShowLogin={setShowLogin} />
    </AuthProvider>
  );
};

const AuthWrapper: React.FC<{
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
}> = ({ showLogin, setShowLogin }) => {
  const { user } = useAuth();

  if (!user) {
    return showLogin ? (
      <Login onToggle={() => setShowLogin(false)} />
    ) : (
      <Register onToggle={() => setShowLogin(true)} />
    );
  }

  return <Dashboard />;
};

export default App