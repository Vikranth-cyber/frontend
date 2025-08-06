import React from 'react';

const HistoryTable = ({ data, loading, error }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'First scan':
        return <span style={styles.genuineBadge}>Genuine</span>;
      case 'Duplicate scan':
        return <span style={styles.duplicateBadge}>Duplicate</span>;
      default:
        return <span style={styles.invalidBadge}>Invalid</span>;
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Scan History</h2>
      
      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : data.length === 0 ? (
        <div style={styles.empty}>No scan history available</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product ID</th>
                <th style={styles.th}>Manufacturer</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Pincode</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>{item.product_id}</td>
                  <td style={styles.td}>{item.manufacturer}</td>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.phone}</td>
                  <td style={styles.td}>{item.pincode}</td>
                  <td style={styles.td}>{getStatusBadge(item.status)}</td>
                  <td style={styles.td}>{new Date(item.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '25px',
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#7f8c8d',
  },
  error: {
    textAlign: 'center',
    padding: '20px',
    color: '#e74c3c',
    backgroundColor: '#fadbd8',
    borderRadius: '5px',
  },
  empty: {
    textAlign: 'center',
    padding: '20px',
    color: '#7f8c8d',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#2c3e50',
    borderBottom: '1px solid #ddd',
  },
  tr: {
    borderBottom: '1px solid #eee',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  td: {
    padding: '12px 15px',
    color: '#34495e',
  },
  genuineBadge: {
    backgroundColor: '#d5f5e3',
    color: '#27ae60',
    padding: '5px 10px',
    borderRadius: '50px',
    fontSize: '14px',
  },
  duplicateBadge: {
    backgroundColor: '#fdebd0',
    color: '#e67e22',
    padding: '5px 10px',
    borderRadius: '50px',
    fontSize: '14px',
  },
  invalidBadge: {
    backgroundColor: '#fadbd8',
    color: '#e74c3c',
    padding: '5px 10px',
    borderRadius: '50px',
    fontSize: '14px',
  },
};


export default HistoryTable;