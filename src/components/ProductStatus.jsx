import React from 'react';

const ProductStatus = ({ products, loading, error }) => {
  const getStatusBadge = (status, scanCount) => {
    if (scanCount === 0) {
      return <span style={styles.notScannedBadge}>Not Scanned</span>;
    } else if (scanCount === 1) {
      return <span style={styles.scannedBadge}>Scanned</span>;
    } else {
      return <span style={styles.duplicateBadge}>Duplicate/Multiple ({scanCount})</span>;
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Product Status</h2>
      
      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : products.length === 0 ? (
        <div style={styles.empty}>No products available</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product ID</th>
                <th style={styles.th}>Manufacturer</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Scan Count</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id} style={styles.tr}>
                  <td style={styles.td}>{product.product_id}</td>
                  <td style={styles.td}>{product.manufacturer}</td>
                  <td style={styles.td}>{getStatusBadge(product.status, product.scan_count)}</td>
                  <td style={styles.td}>{product.scan_count}</td>
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
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '25px',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    padding: '10px',
    zIndex: 1,
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
    maxHeight: 'calc(100% - 80px)',
    overflowY: 'auto',
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
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  tr: {
    borderBottom: '1px solid #eee',
    ':hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  td: {
    padding: '12px 15px',
    color: '#34495e',
  },
  scannedBadge: {
    backgroundColor: '#d5f5e3',
    color: '#27ae60',
    padding: '5px 10px',
    borderRadius: '50px',
    fontSize: '14px',
  },
  notScannedBadge: {
    backgroundColor: '#f0f0f0',
    color: '#7f8c8d',
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
};

export default ProductStatus;