import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import 'qr-scanner/qr-scanner-worker.min.js';
import { scanProduct } from '../services/api';

const QRScanner = ({ onClose, token }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [useWebcam, setUseWebcam] = useState(true);
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    phone: false,
    pincode: false
  });
  const [scanPopup, setScanPopup] = useState({
    show: false,
    message: '',
    type: ''
  });
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [scanCooldown, setScanCooldown] = useState(false);

  // Cooldown timer for preventing duplicate scans
  useEffect(() => {
    let cooldownTimer;
    if (scanCooldown) {
      cooldownTimer = setTimeout(() => {
        setScanCooldown(false);
        setLastScannedCode(null);
      }, 5000); // 5 seconds cooldown
    }
    return () => clearTimeout(cooldownTimer);
  }, [scanCooldown]);

  const validatePhone = (number) => {
    return /^\d{10}$/.test(number);
  };

  const handleScanSubmit = async (scanData) => {
    setLoading(true);
    setError('');
    try {
      const response = await scanProduct(scanData);
      setResult(response);
      
      let popupType = '';
      if (response.status === 'genuine') popupType = 'success';
      else if (response.status === 'already_scanned') popupType = 'warning';
      else popupType = 'error';
      
      setScanPopup({
        show: true,
        message: response.message,
        type: popupType
      });
      
      setTimeout(() => {
        setScanPopup({ show: false, message: '', type: '' });
      }, 3000);
      
    } catch (err) {
      setError(err.message);
      setResult({
        status: 'error',
        message: err.message
      });
      setScanPopup({
        show: true,
        message: err.message,
        type: 'error'
      });
      setTimeout(() => {
        setScanPopup({ show: false, message: '', type: '' });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!formSubmitted) return;

    const initScanner = async () => {
      try {
        const cameras = await QrScanner.listCameras();
        if (cameras.length === 0) {
          setUseWebcam(false);
          return;
        }

        setHasCamera(true);
        
        if (useWebcam && videoRef.current) {
          if (scannerRef.current) {
            scannerRef.current.stop();
            scannerRef.current.destroy();
          }
          
          scannerRef.current = new QrScanner(
            videoRef.current,
            async (result) => {
              // Prevent repeated scans of the same QR code during cooldown
              if (scanCooldown && result.data === lastScannedCode) {
                return;
              }
              setLastScannedCode(result.data);
              setScanCooldown(true);

              try {
                await handleScanSubmit({
                  product_id: result.data,
                  name,
                  phone,
                  pincode
                });
              } catch (err) {
                console.error('Scan error:', err);
              }
            },
            {
              highlightScanRegion: true,
              maxScansPerSecond: 1,
              preferredCamera: 'environment',
              returnDetailedScanResult: true
            }
          );
          
          await scannerRef.current.start();
          setIsScanning(true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setUseWebcam(false);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [useWebcam, formSubmitted, name, phone, pincode, scanCooldown, lastScannedCode]);

  const validateForm = () => {
    const errors = {
      name: !name.trim(),
      phone: !validatePhone(phone),
      pincode: !pincode.trim()
    };
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setFormSubmitted(true);
      setTimeout(() => {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file);
      await handleScanSubmit({
        product_id: result,
        name,
        phone,
        pincode
      });
    } catch (err) {
      console.error('File scan error:', err);
      setError('Failed to scan QR code from image');
      setScanPopup({
        show: true,
        message: 'Failed to scan QR code from image',
        type: 'error'
      });
      setTimeout(() => {
        setScanPopup({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const resetScanner = () => {
    setFormSubmitted(false);
    setResult(null);
    setFieldErrors({
      name: false,
      phone: false,
      pincode: false
    });
    containerRef.current.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.status === 'invalid') {
      return (
        <div style={styles.errorResult}>
          <h3>❌ Invalid Product</h3>
          <p>{result.message}</p>
          {result.scanned_code && (
            <div style={styles.scannedData}>
              <p><strong>Scanned Code:</strong> {result.scanned_code}</p>
            </div>
          )}
        </div>
      );
    }

    if (result.status === 'error') {
      return (
        <div style={styles.errorResult}>
          <h3>❌ Error</h3>
          <p>{result.message}</p>
        </div>
      );
    }

    return (
      <div style={result.status === 'already_scanned' ? styles.warningResult : styles.successResult}>
        <h3>
          {result.status === 'genuine' ? '✅ Genuine Product' : '⚠️ Already Scanned'}
        </h3>
        <div style={styles.productInfo}>
          <p><strong>Product ID:</strong> {result.product?.product_id}</p>
          <p><strong>Manufacturer:</strong> {result.product?.manufacturer}</p>
        </div>
        <p>{result.message}</p>
        {result.status === 'already_scanned' && result.first_scan && (
          <div style={styles.additionalInfo}>
            <p><strong>First scanned by:</strong> {result.first_scan.name}</p>
            <p><strong>First scan date:</strong> {new Date(result.first_scan.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container} ref={containerRef}>
      {scanPopup.show && (
        <div style={{
          ...styles.scanPopup,
          backgroundColor: scanPopup.type === 'success' ? '#d5f5e3' : 
                          scanPopup.type === 'warning' ? '#fdebd0' : '#fadbd8',
          color: scanPopup.type === 'success' ? '#27ae60' : 
                scanPopup.type === 'warning' ? '#e67e22' : '#e74c3c',
          borderColor: scanPopup.type === 'success' ? '#27ae60' : 
                     scanPopup.type === 'warning' ? '#e67e22' : '#e74c3c'
        }}>
          {scanPopup.message}
        </div>
      )}
      
      <div style={styles.content}>
        <button style={styles.closeButton} onClick={onClose}>← Back</button>
        <h2 style={styles.title}>Product Verification</h2>
        
        {!formSubmitted ? (
          <form onSubmit={handleFormSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Your Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors({...fieldErrors, name: false});
                }}
                style={{
                  ...styles.input,
                  borderColor: fieldErrors.name ? '#e74c3c' : '#ddd'
                }}
                placeholder="Enter your full name"
              />
              {fieldErrors.name && (
                <span style={styles.errorText}>Name is required</span>
              )}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(value);
                  setFieldErrors({...fieldErrors, phone: false});
                }}
                style={{
                  ...styles.input,
                  borderColor: fieldErrors.phone ? '#e74c3c' : '#ddd'
                }}
                placeholder="10 digit mobile number"
              />
              {fieldErrors.phone && (
                <span style={styles.errorText}>
                  {phone.length === 0 ? 'Phone number is required' : 'Please enter exactly 10 digits'}
                </span>
              )}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Pincode *</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setFieldErrors({...fieldErrors, pincode: false});
                }}
                style={{
                  ...styles.input,
                  borderColor: fieldErrors.pincode ? '#e74c3c' : '#ddd'
                }}
                placeholder="Enter your area pincode"
              />
              {fieldErrors.pincode && (
                <span style={styles.errorText}>Pincode is required</span>
              )}
            </div>
            
            <button 
              type="submit" 
              style={styles.submitButton}
            >
              Proceed to Scan
            </button>
          </form>
        ) : (
          <>
            <div style={styles.userInfo}>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Phone:</strong> {phone}</p>
              <p><strong>Pincode:</strong> {pincode}</p>
              <button 
                style={styles.changeButton} 
                onClick={resetScanner}
              >
                Change Details
              </button>
            </div>

            <div style={styles.scannerContainer}>
              {useWebcam ? (
                <div style={styles.videoContainer}>
                  <video 
                    ref={videoRef} 
                    style={styles.video}
                    playsInline 
                  />
                  <div style={styles.scanOverlay}>
                    {isScanning ? 'Scanning...' : 'Camera ready'}
                  </div>
                </div>
              ) : (
                <div style={styles.fileUploadContainer}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    style={styles.fileInput}
                    id="qr-upload"
                  />
                  <label htmlFor="qr-upload" style={styles.fileInputLabel}>
                    Upload QR Image
                  </label>
                </div>
              )}
              
              <button 
                style={styles.toggleButton}
                onClick={() => setUseWebcam(!useWebcam)}
              >
                {useWebcam ? 'Upload QR Image Instead' : 'Use Webcam Instead'}
              </button>
            </div>

            {loading && (
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                Verifying product...
              </div>
            )}

            {renderResult()}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '0',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    boxSizing: 'border-box',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    height: '100vh',
    maxHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  content: {
    padding: '24px',
    flex: 1,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#4a6fa5',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontWeight: '600',
    transition: 'color 0.2s',
    ':hover': {
      color: '#2c3e50'
    }
  },
  title: {
    color: '#2c3e50',
    marginBottom: '25px',
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '-0.5px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '30px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative'
  },
  label: {
    fontSize: '14px',
    color: '#34495e',
    fontWeight: '600'
  },
  input: {
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid #dfe6e9',
    fontSize: '16px',
    transition: 'all 0.3s',
    ':focus': {
      borderColor: '#4a6fa5',
      boxShadow: '0 0 0 3px rgba(74, 111, 165, 0.2)',
      outline: 'none'
    }
  },
  errorText: {
    color: '#e74c3c',
    fontSize: '13px',
    marginTop: '4px'
  },
  submitButton: {
    padding: '16px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: '#3a5a80',
      transform: 'translateY(-2px)'
    },
    ':active': {
      transform: 'translateY(0)'
    }
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '25px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
    borderLeft: '4px solid #4a6fa5'
  },
  changeButton: {
    background: 'none',
    border: 'none',
    color: '#4a6fa5',
    cursor: 'pointer',
    marginTop: '12px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'color 0.2s',
    ':hover': {
      color: '#2c3e50',
      textDecoration: 'underline'
    }
  },
  scannerContainer: {
    marginBottom: '30px',
    position: 'relative'
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '300px',
    backgroundColor: '#000',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '20px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '18px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    fontWeight: '500'
  },
  fileUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '50px 20px',
    border: '2px dashed #bdc3c7',
    borderRadius: '12px',
    marginBottom: '20px',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.3s',
    ':hover': {
      borderColor: '#4a6fa5',
      backgroundColor: '#f0f4f8'
    }
  },
  fileInput: {
    display: 'none'
  },
  fileInputLabel: {
    padding: '14px 24px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: '600',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: '#3a5a80',
      transform: 'translateY(-2px)'
    }
  },
  toggleButton: {
    padding: '12px 20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dfe6e9',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'block',
    margin: '0 auto',
    fontWeight: '600',
    color: '#34495e',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: '#e8edf2',
      borderColor: '#bdc3c7'
    }
  },
  successResult: {
    marginTop: '25px',
    padding: '20px',
    backgroundColor: '#d5f5e3',
    color: '#27ae60',
    borderRadius: '12px',
    textAlign: 'center',
    borderLeft: '4px solid #27ae60',
    boxShadow: '0 4px 12px rgba(39, 174, 96, 0.1)'
  },
  warningResult: {
    marginTop: '25px',
    padding: '20px',
    backgroundColor: '#fdebd0',
    color: '#e67e22',
    borderRadius: '12px',
    textAlign: 'center',
    borderLeft: '4px solid #e67e22',
    boxShadow: '0 4px 12px rgba(230, 126, 34, 0.1)'
  },
  errorResult: {
    marginTop: '25px',
    padding: '20px',
    backgroundColor: '#fadbd8',
    color: '#e74c3c',
    borderRadius: '12px',
    textAlign: 'center',
    borderLeft: '4px solid #e74c3c',
    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.1)'
  },
  productInfo: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: '8px',
    textAlign: 'left'
  },
  additionalInfo: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '8px',
    textAlign: 'left'
  },
  scannedData: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    fontFamily: 'monospace',
    textAlign: 'left'
  },
  loading: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    color: '#7f8c8d',
    borderRadius: '12px',
    marginTop: '25px',
    textAlign: 'center',
    fontWeight: '500',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  spinner: {
    border: '3px solid rgba(74, 111, 165, 0.2)',
    borderTop: '3px solid #4a6fa5',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    animation: 'spin 1s linear infinite'
  },
  scanPopup: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '15px 25px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: '1000',
    fontWeight: '600',
    textAlign: 'center',
    minWidth: '300px',
    maxWidth: '90%',
    animation: 'fadeIn 0.3s, fadeOut 0.3s 2.7s forwards'
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  '@keyframes fadeIn': {
    'from': { opacity: 0, top: 0 },
    'to': { opacity: 1, top: '20px' }
  },
  '@keyframes fadeOut': {
    'from': { opacity: 1, top: '20px' },
    'to': { opacity: 0, top: 0 }
  },
  '@media (max-width: 768px)': {
    container: {
      borderRadius: '0',
      padding: '0',
      maxWidth: '100%',
      minHeight: '100vh'
    },
    content: {
      padding: '20px 15px'
    },
    title: {
      fontSize: '24px'
    },
    videoContainer: {
      height: '250px'
    }
  },
  '@media (max-width: 480px)': {
    input: {
      padding: '12px 14px'
    },
    submitButton: {
      padding: '14px'
    },
    videoContainer: {
      height: '200px'
    }
  }
};

export default QRScanner;