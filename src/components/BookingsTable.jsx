export default function BookingsTable({ bookings, onStatusChange }) {
  if (!bookings.length) {
    return <p>No reservation requests yet.</p>;
  }

  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Customer</th>
            <th style={styles.th}>Vehicle</th>
            <th style={styles.th}>Dates</th>
            <th style={styles.th}>Contact</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td style={styles.td}>{b.customerName}</td>
              <td style={styles.td}>{b.vehicleName}</td>
              <td style={styles.td}>{b.startDate} → {b.endDate}</td>
              <td style={styles.td}>
                <div>{b.email}</div>
                <div style={{ color: '#5C5747' }}>{b.phone}</div>
              </td>
              <td style={styles.td}>
                <select
                  value={b.status}
                  onChange={(e) => onStatusChange(b.id, e.target.value)}
                  style={styles.select}
                  className={`status-select status-${b.status}`}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  tableWrap: { overflowX: 'auto', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-m)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 640, background: 'var(--paper)' },
  th: {
    textAlign: 'left', padding: '12px 16px', fontSize: '0.8rem',
    borderBottom: '1.5px solid var(--line)', color: '#5C5747',
  },
  td: { padding: '12px 16px', fontSize: '0.9rem', borderBottom: '1px solid var(--line)', verticalAlign: 'top' },
  select: {
    padding: '6px 10px', borderRadius: 'var(--radius-s)', border: '1.5px solid var(--line)',
    fontFamily: 'inherit', fontSize: '0.85rem', background: 'var(--paper)',
  },
};
