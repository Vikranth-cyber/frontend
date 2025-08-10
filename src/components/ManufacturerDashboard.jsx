import React, { useState, useEffect } from 'react';
import QRUpload from './QRUpload';
import ProductStatus from './ProductStatus';
import AlertNotifications from './AlertNotifications';
import { fetchProducts, fetchNotifications, downloadSampleCSV } from '../services/api';

const ManufacturerDashboard = ({ token, onFileUpload, loading, error, onLogout }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    const handleDownloadSample = async () => {
    try {
      const blob = await downloadSampleCSV(token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_products.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download sample:', err);
      alert('Failed to download sample CSV. Please try again.');
    }
  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const isMobile = screenWidth <= 640;
  const isTablet = screenWidth > 640 && screenWidth <= 1024;

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: isMobile ? '16px' : isTablet ? '20px' : '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      width: isMobile ? '95%' : '90%',
      maxWidth: '1200px',
      height: isMobile ? '90vh' : '85vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      margin: 'auto',
      boxSizing: 'border-box'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isMobile ? '12px' : '20px',
      flexWrap: 'wrap',
      gap: '12px'
    },
    tabsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: isMobile ? '4px' : '8px'
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      gap: isMobile ? '4px' : '8px',
      flexWrap: 'wrap'
    },
    tab: {
      padding: isMobile ? '8px 12px' : '10px 16px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '14px',
      color: '#64748b',
      fontWeight: '500',
      letterSpacing: '0.5px',
      transition: 'all 0.2s ease',
      borderRadius: '6px',
      whiteSpace: 'nowrap',
      '&:hover': {
        backgroundColor: '#f1f5f9'
      }
    },
    activeTab: {
      padding: isMobile ? '8px 12px' : '10px 16px',
      backgroundColor: '#f8fafc',
      border: 'none',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '14px',
      color: '#4a6fa5',
      fontWeight: '600',
      letterSpacing: '0.5px',
      borderRadius: '6px',
      borderBottom: '2px solid #4a6fa5',
      whiteSpace: 'nowrap'
    },
    logoutButton: {
      padding: '8px',
      backgroundColor: '#f1f5f9',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#e2e8f0'
      }
    },
    sampleButton: {
      padding: isMobile ? '6px 10px' : '8px 12px',
      backgroundColor: '#f1f5f9',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '14px',
      color: '#4a6fa5',
      fontWeight: '500',
      marginLeft: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      '&:hover': {
        backgroundColor: '#e2e8f0'
      }
    },
    content: {
      flex: 1,
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      padding: '4px 0'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.tabsContainer}>
          <div style={styles.tabs}>
            <button
              style={activeTab === 'upload' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('upload')}
            >
              {isMobile ? 'Upload' : 'Upload Products'}
            </button>
            <button
              style={activeTab === 'status' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('status')}
            >
              {isMobile ? 'Status' : 'Product Status'}
            </button>
            <button
              style={activeTab === 'notifications' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('notifications')}
            >
              {isMobile ? 'Alerts' : 'Notifications'}
            </button>
          </div>
          <button
            style={styles.sampleButton}
            onClick={handleDownloadSample}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15V3M12 15L8 11M12 15L16 11M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="#4a6fa5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isMobile ? 'Sample' : 'Get Sample CSV'}
          </button>
        </div>
        <button 
          style={styles.logoutButton} 
          onClick={onLogout} 
          title="Logout"
          aria-label="Logout"
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
            isMobile={isMobile}
          />
        )}
        {activeTab === 'status' && (
          <ProductStatus 
            products={products} 
            loading={dashboardLoading} 
            error={error} 
            isMobile={isMobile}
          />
        )}
        {activeTab === 'notifications' && (
          <AlertNotifications 
            notifications={notifications} 
            loading={dashboardLoading} 
            error={error} 
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default ManufacturerDashboard;