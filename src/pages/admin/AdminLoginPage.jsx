import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Seo } from '../../components/common/Seo.jsx';

export default function AdminLoginPage() {
  const { login, isAuthed } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthed) navigate('/admin', { replace: true });
  }, [isAuthed, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Admin Login" description="Sign in to the store admin panel." noIndex />
      <div className="admin-body admin-login">
        <div className="admin-login__side">
          <div>
            <Link to="/" className="brand">
              <span className="brand__mark" aria-hidden="true">S</span>
              <span>
                Ladies Suits
                <span className="brand__sub" aria-hidden="true">Store Admin</span>
              </span>
            </Link>
            <h1 className="admin-login__side-title">Manage your store from anywhere.</h1>
            <p className="admin-login__side-sub">
              Products, categories, inventory, orders and customers — all in one clean dashboard.
            </p>
          </div>
          <p className="admin-login__side-foot">Works even when your laptop is switched off — powered by the cloud.</p>
        </div>

        <div className="admin-login__main">
          <div className="login-card">
            <h2 className="login-card__title">Sign in</h2>
            <p className="login-card__sub">Use your admin credentials to continue.</p>

            {error && (
              <div className="chip-badge chip-badge--red" style={{ marginBottom: '1rem', width: '100%', justifyContent: 'center', padding: '0.6rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} noValidate>
              <div className="field">
                <label className="field__label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  className="input"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="login-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    className="input"
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.6rem' }}
                  />
                  <button
                    type="button"
                    aria-label={show ? 'Hide password' : 'Show password'}
                    onClick={() => setShow((s) => !s)}
                    style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
                {busy ? (
                  <><span className="spinner" style={{ width: 18, height: 18, borderTopColor: 'var(--primary)' }} /> Signing in…</>
                ) : (
                  <><Lock size={16} /> Sign In</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}