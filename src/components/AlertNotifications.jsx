import React from 'react';

const AlertNotifications = ({ notifications, loading, error }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Alerts & Notifications</h2>
      
      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : notifications.length === 0 ? (
        <div style={styles.empty}>No new notifications</div>
      ) : (
        <div style={styles.notificationsList}>
          {notifications.map((notification) => (
            <div key={notification.id} style={styles.notificationCard}>
              <div style={styles.notificationHeader}>
                <span style={styles.notificationDate}>
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
                <span style={styles.notificationAlert}>ALERT</span>
              </div>
              <p style={styles.notificationMessage}>{notification.message}</p>
              <div style={styles.notificationDetails}>
                <p><strong>Product ID:</strong> {notification.product_id}</p>
                <p><strong>Scanned by:</strong> {notification.scanned_by} ({notification.phone})</p>
                <p><strong>Pincode:</strong> {notification.pincode}</p>
              </div>
            </div>
          ))}
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
  notificationsList: {
    maxHeight: 'calc(100% - 80px)',
    overflowY: 'auto',
    padding: '10px',
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #e74c3c',
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  notificationDate: {
    color: '#7f8c8d',
    fontSize: '14px',
  },
  notificationAlert: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  notificationMessage: {
    margin: '10px 0',
    color: '#2c3e50',
  },
  notificationDetails: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '5px',
    fontSize: '14px',
  }
};

export default AlertNotifications;