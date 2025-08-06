import React, { useState, useEffect } from 'react';
import QRUpload from './QRUpload';
import ProductStatus from './ProductStatus';
import AlertNotifications from './AlertNotifications';
import { fetchProducts, fetchNotifications } from '../services/api';

const ManufacturerDashboard = ({ 
  token,
  onFileUpload,
  loading,
  error,
  onLogout // Added logout prop
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        if (activeTab === 'status') {
          const response = await fetchProducts(token);
          setProducts(response.products);
        } else if (activeTab === 'notifications') {
          const response = await fetchNotifications(token);
          setNotifications(response.notifications);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadData();
  }, [activeTab, token]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.tabs}>
          <button 
            style={activeTab === 'upload' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('upload')}
          >
            Upload Products
          </button>
          <button 
            style={activeTab === 'status' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('status')}
          >
            Product Status
          </button>
          <button 
            style={activeTab === 'notifications' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>
        <button 
          style={styles.logoutButton}
          onClick={onLogout}
          title="Logout"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div style={styles.content}>
        {activeTab === 'upload' && (
          <QRUpload 
            token={token}
            loading={loading}
            error={error}
            onUpload={onFileUpload}
          />
        )}
        
        {activeTab === 'status' && (
          <ProductStatus 
            products={products} 
            loading={dashboardLoading}
            error={error}
          />
        )}
        
        {activeTab === 'notifications' && (
          <AlertNotifications 
            notifications={notifications} 
            loading={dashboardLoading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  tab: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
    marginRight: '8px',
  },
  activeTab: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#4a6fa5',
    borderBottom: '2px solid #4a6fa5',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginRight: '8px',
  },
  logoutButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#f1f5f9',
    }
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }
};

export default ManufacturerDashboard;