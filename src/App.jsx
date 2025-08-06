import React, { useState } from 'react';
import {
  registerUser,
  loginUser,
  scanProduct,
  fetchScans,
  fetchNotifications,
  fetchProducts
} from './services/api';

import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import QRScanner from './components/QRScanner';
import ManufacturerDashboard from './components/ManufacturerDashboard';
import HistoryTable from './components/HistoryTable';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isManufacturer, setIsManufacturer] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [token, setToken] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const handleLogin = async (username, password) => {
    setLoading(true);
    clearError();
    try {
      const { token, is_manufacturer } = await loginUser(username, password);
      setToken(token);
      setIsLoggedIn(true);
      setIsManufacturer(is_manufacturer);
      setShowLoginModal(false);

      if (is_manufacturer) {
        await fetchProducts(token);
      } else {
        await loadScanHistory(token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (username, password, isManufacturer) => {
    setLoading(true);
    clearError();
    try {
      await registerUser(username, password, isManufacturer);
      await handleLogin(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadScanHistory = async (token) => {
    try {
      const { scans } = await fetchScans(token);
      setScanHistory(scans);
    } catch (err) {
      console.error("Failed to fetch scan history:", err);
      setError('Failed to load scan history');
    }
  };

  const handleScanSubmit = async (scanData) => {
    setLoading(true);
    clearError();
    try {
      const result = await scanProduct(scanData);
      setScanResult(result);
      await loadScanHistory(token);
      return result;
    } catch (err) {
      setError(err.message);
      return { status: 'error', message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fix: move this ABOVE the return
  const handleFileUpload = async (file) => {
    setLoading(true);
    clearError();
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload_csv`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      alert(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setIsLoggedIn(false);
    setIsManufacturer(false);
    setShowScanner(false);
    clearError();
  };

  return (
    <div style={styles.app}>
      {!isLoggedIn && !showScanner && (
        <LandingPage
          onLoginClick={() => setShowLoginModal(true)}
          onScanClick={() => setShowScanner(true)}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={loading}
          error={error}
        />
      )}

      {isLoggedIn && !isManufacturer && (
        <div style={styles.navbar}>
          <button
            style={styles.navButton}
            onClick={() => {
              setShowScanner(true);
              setScanResult(null);
            }}
          >
            Scan Product
          </button>
          <button
            style={styles.navButton}
            onClick={() => {
              setShowScanner(false);
              loadScanHistory(token);
            }}
          >
            Scan History
          </button>
          <button style={styles.navButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {isLoggedIn && isManufacturer && (
        <div style={styles.dashboardContainer}>
          <ManufacturerDashboard
            token={token}
            onFileUpload={handleFileUpload}
            loading={loading}
            error={error}
            onLogout={handleLogout}
          />
        </div>
      )}

      {showScanner && (
        <div style={styles.scannerContainer}>
          <QRScanner
            onClose={() => setShowScanner(false)}
            onSubmit={handleScanSubmit}
            result={scanResult}
            loading={loading}
            error={error}
          />
        </div>
      )}

      {isLoggedIn && !isManufacturer && !showScanner && (
        <div style={styles.content}>
          <HistoryTable
            data={scanHistory}
            loading={loading}
            error={error}
          />
        </div>
      )}

      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button style={styles.closeError} onClick={clearError}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    margin: '20px 0',
    padding: '15px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    width: '90%',
    maxWidth: '1200px',
  },
  navButton: {
    padding: '12px 24px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    letterSpacing: '0.5px',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    width: '90%',
    maxWidth: '1200px',
    margin: '0 auto 30px',
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  dashboardContainer: {
    width: '90%',
    maxWidth: '1200px',
    height: 'calc(100vh - 80px)',
    margin: '20px auto',
    display: 'flex',
    flexDirection: 'column',
  },
  scannerContainer: {
    width: '90%',
    maxWidth: '800px',
    margin: '40px auto',
  },
  errorBanner: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    fontSize: '14px',
  },
  closeError: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    padding: 0,
    marginLeft: '10px',
  },
};

export default App;
