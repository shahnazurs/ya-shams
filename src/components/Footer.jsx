import { APP_NAME } from '../config';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        <p style={styles.text}>
          {APP_NAME} — vans and cars for the roads worth taking. Reservations are
          confirmed by our team within one business day.
        </p>
        <p style={styles.small}>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'var(--ink)',
    color: 'var(--stone)',
    marginTop: 64,
  },
  inner: {
    padding: '32px 24px',
  },
  text: {
    color: 'var(--stone)',
    opacity: 0.85,
    marginBottom: 8,
    fontSize: '0.9rem',
  },
  small: {
    fontSize: '0.8rem',
    opacity: 0.6,
    margin: 0,
  },
};
