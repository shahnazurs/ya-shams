import { useState } from 'react';
import { api, setAdminToken } from '../api';
import { DEMO_MODE } from '../config';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setChecking(true);
    setError('');
    const ok = await api.login(password);
    setChecking(false);
    if (ok) {
      setAdminToken(password);
      window.location.reload();
    } else {
      setError('Incorrect password.');
    }
  }

  return (
    <main className="container" style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Admin sign-in</h1>
        <p style={styles.copy}>
          Manage the fleet and review reservation requests.
        </p>
        {DEMO_MODE && (
          <p style={styles.demoNote}>
            Demo mode — password is <code>admin123</code>. Connect a Google Sheet in
            src/config.js to replace this with a real admin token.
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="field-error" style={{ marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={checking}>
            {checking ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles = {
  wrap: { display: 'flex', justifyContent: 'center', padding: '64px 24px' },
  card: {
    background: 'var(--paper)', border: '1.5px solid var(--line)',
    borderRadius: 'var(--radius-m)', padding: 32, maxWidth: 400, width: '100%',
  },
  h1: { fontSize: '1.6rem' },
  copy: { fontSize: '0.95rem', color: '#5C5747' },
  demoNote: {
    background: '#F3E4C5', color: '#7A5A17', fontSize: '0.85rem',
    padding: '10px 12px', borderRadius: 'var(--radius-s)', marginBottom: 16,
  },
};
