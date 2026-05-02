import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = ({ onToggle }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="auth-card">
      <h2>Welcome back</h2>
      <p>Sign in to continue your conversations</p>

      {error && <div className="auth-error" id="login-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit} id="login-form">
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={loading}
          id="login-submit"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-toggle">
        Don't have an account?{' '}
        <button onClick={onToggle} id="switch-to-register">
          Create one
        </button>
      </div>

      <div className="auth-demo-info">
        <strong>Demo Accounts:</strong><br />
        Alice: alice@demo.com / password123<br />
        Bob: bob@demo.com / password123
      </div>
    </div>
  );
};

export default Login;
